/**
 * Analytics domain.
 *
 * Everything the Analytics view draws comes from `analytics(range, chain)`.
 * The range and chain controls are real: totals, every series, and the
 * period-over-period deltas are all derived from the same generator, so the
 * tiles and the charts can never disagree about what window you're looking at.
 *
 * Figures are deterministic, seeded by (range, chain, series), because a
 * chart that re-rolls its own noise on every React render is unreadable, and
 * because a screenshot has to be reproducible.
 */

import { chains, providers } from './mock';

/* ============================================================
   Range + chain
   ============================================================ */

export type RangeId = '1d' | '7d' | '30d';

export const ranges: { id: RangeId; label: string; window: string; prior: string }[] = [
  { id: '1d', label: '1D', window: 'Past 24 hours', prior: 'prior day' },
  { id: '7d', label: '7D', window: 'Past 7 days', prior: 'prior week' },
  { id: '30d', label: '30D', window: 'Past 30 days', prior: 'prior month' },
];

export const rangeMeta = Object.fromEntries(ranges.map((r) => [r.id, r])) as Record<
  RangeId,
  (typeof ranges)[number]
>;

/** `all` plus the chains that actually carry traffic on this project. */
export const trafficChains = [
  { id: 'ethereum', name: 'Ethereum', share: 0.34 },
  { id: 'base', name: 'Base', share: 0.19 },
  { id: 'polygon', name: 'Polygon', share: 0.12 },
  { id: 'solana', name: 'Solana', share: 0.11 },
  { id: 'arbitrum', name: 'Arbitrum', share: 0.09 },
  { id: 'optimism', name: 'Optimism', share: 0.06 },
  { id: 'bnb', name: 'BNB Chain', share: 0.05 },
  { id: 'avalanche', name: 'Avalanche', share: 0.04 },
] as const;

export type ChainFilter = 'all' | (typeof trafficChains)[number]['id'];

const chainById = new Map(chains.map((c) => [c.id, c]));
export const chainColor = (id: string) => chainById.get(id)?.color ?? 'var(--ub-border)';
export const chainIcon = (id: string) => chainById.get(id)?.icon;

/* ============================================================
   Deterministic noise
   ============================================================ */

/** FNV-1a, so a string key maps to a stable seed. */
function seedOf(key: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small LCG. Same key in, same sequence out, forever. */
function rng(key: string) {
  let s = seedOf(key) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

/* ============================================================
   Buckets
   ============================================================ */

/** Fixed clock. Nothing here is "now": a moving now makes screenshots differ. */
const NOW = Date.UTC(2026, 7, 10, 14, 20);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

type Bucket = { label: string; /** hour-of-day at the bucket centre */ hod: number; dow: number };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (n: number) => String(n).padStart(2, '0');

function buckets(range: RangeId): Bucket[] {
  const at = (ms: number): Omit<Bucket, 'label'> => {
    const d = new Date(ms);
    return { hod: d.getUTCHours() + d.getUTCMinutes() / 60, dow: d.getUTCDay() };
  };

  if (range === '1d') {
    // 12 × 2 hours
    return Array.from({ length: 12 }, (_, i) => {
      const ms = NOW - (11 - i) * 2 * HOUR;
      const d = new Date(ms);
      return { label: `${pad(d.getUTCHours())}:00`, ...at(ms) };
    });
  }
  if (range === '7d') {
    return Array.from({ length: 7 }, (_, i) => {
      const ms = NOW - (6 - i) * DAY;
      const d = new Date(ms);
      return { label: DAYS[d.getUTCDay()], ...at(ms) };
    });
  }
  return Array.from({ length: 30 }, (_, i) => {
    const ms = NOW - (29 - i) * DAY;
    const d = new Date(ms);
    return { label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`, ...at(ms) };
  });
}

/** Diurnal load: peak mid-afternoon, trough before dawn. */
const diurnal = (hod: number) => 1 + 0.62 * Math.cos(((hod - 14) / 24) * 2 * Math.PI);
/** Weekly load: weekends are quieter. */
const weekly = (dow: number) => (dow === 0 || dow === 6 ? 0.72 : 1.07);

/**
 * Bucket weights for a range. Sub-day ranges vary by hour; multi-day ranges
 * have already averaged the daily curve out, so they vary by weekday instead.
 */
function weights(range: RangeId, bs: Bucket[], key: string) {
  const r = rng(key);
  const byHour = range === '1d';
  return bs.map((b) => {
    const base = byHour ? diurnal(b.hod) : weekly(b.dow);
    return Math.max(0.05, base * (0.92 + r() * 0.16));
  });
}

/** Distributes `total` across buckets in proportion to `w`, as whole numbers. */
function spread(total: number, w: number[]) {
  const sum = w.reduce((a, b) => a + b, 0);
  const out = w.map((x) => Math.round((x / sum) * total));
  // Push the rounding remainder onto the largest bucket so the series still
  // sums to the figure printed on the tile.
  const drift = total - out.reduce((a, b) => a + b, 0);
  if (drift !== 0) {
    const peak = out.indexOf(Math.max(...out));
    out[peak] += drift;
  }
  return out;
}

/* ============================================================
   Volume model
   ============================================================ */

/**
 * Anchored on the 30-day figure, which is the one the status-code counts and
 * the compute-unit allowance were both built from. Everything else is that
 * rate scaled to the window, so the tabs stay arithmetically consistent.
 */
const REQUESTS_30D = 2_410_442;
const PER_HOUR = REQUESTS_30D / 720;

const HOURS: Record<RangeId, number> = { '1d': 24, '7d': 168, '30d': 720 };

/** Growth against the preceding window of the same length. */
const GROWTH: Record<RangeId, number> = { '1d': 0.124, '7d': 0.081, '30d': 0.236 };

/** List price. Uniblock bills CUs, not calls. */
export const PRICE_PER_MILLION_CU = 24;

const ERROR_RATE = 0.0177;

/* ============================================================
   Fixed reference tables
   ============================================================ */

/**
 * Uniblock exposes three request surfaces, and they behave differently enough
 * that lumping them together hides the thing that matters:
 *
 * - `unified`  normalised across providers, so Uniblock picks who serves it
 * - `rpc`      raw node access, also routed
 * - `direct`   a provider's own endpoint, proxied. You named the vendor, so
 *              there is nothing to route and nothing to fail over to. When that
 *              vendor is down, the call fails.
 *
 * Weights are a share of all calls in the window and sum to 1, so the endpoint
 * table accounts for the whole window rather than an unexplained fraction of it.
 */
const ENDPOINTS = [
  // Unified: 47.2%
  { name: '/token/balance', weight: 0.186, cu: 3, surface: 'unified', pinned: null },
  { name: '/market/price', weight: 0.098, cu: 2, surface: 'unified', pinned: null },
  { name: '/nft/metadata', weight: 0.07, cu: 6, surface: 'unified', pinned: null },
  { name: '/defi/swap-quote', weight: 0.041, cu: 8, surface: 'unified', pinned: null },
  { name: '/transaction/lookup', weight: 0.034, cu: 4, surface: 'unified', pinned: null },
  { name: '/scan/contract', weight: 0.024, cu: 5, surface: 'unified', pinned: null },
  { name: '/token/holders', weight: 0.019, cu: 9, surface: 'unified', pinned: null },

  // JSON-RPC: 24.9%
  { name: 'eth_call', weight: 0.083, cu: 2, surface: 'rpc', pinned: null },
  { name: 'eth_getBalance', weight: 0.037, cu: 1, surface: 'rpc', pinned: null },
  { name: 'eth_blockNumber', weight: 0.033, cu: 1, surface: 'rpc', pinned: null },
  { name: 'eth_getLogs', weight: 0.03, cu: 12, surface: 'rpc', pinned: null },
  { name: 'eth_getTransactionReceipt', weight: 0.025, cu: 2, surface: 'rpc', pinned: null },
  { name: 'eth_getBlockByNumber', weight: 0.024, cu: 2, surface: 'rpc', pinned: null },
  { name: 'eth_sendRawTransaction', weight: 0.017, cu: 8, surface: 'rpc', pinned: null },

  // Direct: 27.9%. Each is pinned to the vendor named in its own path.
  { name: 'direct/v1/GoldRush/v1/balances', weight: 0.073, cu: 5, surface: 'direct', pinned: 'GoldRush' },
  { name: 'direct/v1/Alchemy/nft/v3/getNFTsForOwner', weight: 0.062, cu: 6, surface: 'direct', pinned: 'Alchemy' },
  { name: 'direct/v1/Kraken/0/public/Ticker', weight: 0.051, cu: 2, surface: 'direct', pinned: 'Kraken' },
  { name: 'direct/v1/Polymarket/markets', weight: 0.048, cu: 3, surface: 'direct', pinned: 'Polymarket' },
  { name: 'direct/v1/CoinGecko/api/v3/simple/price', weight: 0.045, cu: 2, surface: 'direct', pinned: 'CoinGecko' },
] as const;

/** Artwork for vendors that only appear on the Direct surface. */
const DIRECT_ICONS: Record<string, string> = {
  GoldRush: 'GoldRush.svg',
  Alchemy: 'Alchemy.webp',
  Kraken: 'Kraken.webp',
  Polymarket: 'Polymarket.webp',
  CoinGecko: 'CoinGecko.webp',
};

export const SURFACES = [
  { id: 'unified', label: 'Unified', routed: true },
  { id: 'rpc', label: 'JSON-RPC', routed: true },
  { id: 'direct', label: 'Direct', routed: false },
] as const;

export type SurfaceId = (typeof SURFACES)[number]['id'];

/** Share of all calls that Uniblock is free to route. Direct calls are pinned. */
const ROUTED_SHARE = ENDPOINTS.filter((e) => e.surface !== 'direct').reduce(
  (a, e) => a + e.weight,
  0,
);

/**
 * Blended CUs per request, summed off the endpoint table rather than set
 * independently. Declaring it as its own constant is how the allowance panel
 * and the per-endpoint CU column drift apart.
 */
const CU_PER_REQUEST = ENDPOINTS.reduce((a, e) => a + e.weight * e.cu, 0);

// EVM method volumes live in ENDPOINTS with everything else. Solana needs its
// own vocabulary, and these are shares of JSON-RPC traffic, summing to 1.
const SOLANA_METHODS = [
  { name: 'getAccountInfo', weight: 0.33 },
  { name: 'getBalance', weight: 0.19 },
  { name: 'getSlot', weight: 0.15 },
  { name: 'getSignaturesForAddress', weight: 0.12 },
  { name: 'getTransaction', weight: 0.09 },
  { name: 'getTokenAccountsByOwner', weight: 0.07 },
  { name: 'sendTransaction', weight: 0.05 },
];

/** Share of routed traffic, and how each provider behaves when it gets it. */
const PROVIDER_MIX = [
  { id: 'alchemy', share: 0.312, p50: 62, p95: 148, errorRate: 0.006, icon: 'Alchemy.webp' },
  { id: 'quicknode', share: 0.224, p50: 58, p95: 131, errorRate: 0.004, icon: 'QuickNode.webp' },
  { id: 'helius', share: 0.144, p50: 51, p95: 118, errorRate: 0.003, icon: 'Helius.webp' },
  { id: 'infura', share: 0.128, p50: 79, p95: 186, errorRate: 0.009, icon: 'Infura.webp' },
  { id: 'chainstack', share: 0.086, p50: 88, p95: 204, errorRate: 0.011, icon: 'Chainstack.webp' },
  { id: 'ankr', share: 0.058, p50: 104, p95: 246, errorRate: 0.019, icon: 'Ankr.webp' },
  { id: 'moralis', share: 0.032, p50: 132, p95: 318, errorRate: 0.058, icon: 'Moralis.webp' },
  { id: 'tatum', share: 0.016, p50: 121, p95: 274, errorRate: 0.024, icon: 'Tatum.webp' },
];

/** What each provider charges for the same call, buying direct. */
const DIRECT_LIST_PRICE: Record<string, number> = {
  alchemy: 29.4,
  quicknode: 33.1,
  helius: 26.8,
  infura: 31.5,
  chainstack: 27.2,
  ankr: 21.9,
  moralis: 38.4,
  tatum: 30.0,
};

const providerById = new Map(providers.map((p) => [p.id, p]));

/* ============================================================
   Types
   ============================================================ */

export type Point = { label: string };
export type TrafficPoint = Point & { unified: number; rpc: number; direct: number };
export type HealthPoint = Point & { successful: number; failed: number };
export type LatencyPoint = Point & { p50: number; p95: number; p99: number };
export type ComputePoint = Point & { http: number; wss: number };
export type RoutingPoint = Point & { primary: number; failover: number; hedged: number };
export type WsPoint = Point & { connections: number; messages: number };

export type Delta = {
  /** Signed percent change against the preceding window. */
  pct: number;
  /** `up` is not automatically good. See `good`. */
  good: boolean;
};

export type ProviderStat = {
  id: string;
  name: string;
  icon: string;
  requests: number;
  share: number;
  p50: number;
  p95: number;
  errorRate: number;
  uptime: number;
  status: 'operational' | 'degraded';
  /** Share of head-to-head races this provider won on score. */
  winRate: number;
};

export type FailoverEvent = {
  id: string;
  at: string;
  from: string;
  to: string;
  reason: string;
  chain: string;
  requests: number;
  recoveredMs: number;
};

export type ErrorRow = {
  id: string;
  code: number;
  name: string;
  message: string;
  endpoint: string;
  chain: string;
  provider: string;
  count: number;
  share: number;
  lastSeen: string;
  /** True when Uniblock re-routed and the caller never saw the failure. */
  absorbed: boolean;
};

export type FailedRequest = {
  id: string;
  ts: string;
  method: 'GET' | 'POST';
  endpoint: string;
  chain: string;
  status: number;
  latencyMs: number;
  provider: string;
  attempts: number;
};

export type SlowEndpoint = { name: string; p50: number; p95: number; p99: number; calls: number };

export type SplitRow = { id: string; name: string; calls: number; share: number };

/** Everything one endpoint row shows, collapsed and expanded. */
export type EndpointStat = {
  name: string;
  surface: SurfaceId;
  /** Vendor the call is locked to, on the direct surface only. */
  pinned: string | null;
  method: 'GET' | 'POST';
  calls: number;
  /** Percent of all calls in the window. */
  share: number;
  cuPerCall: number;
  cu: number;
  cost: number;
  errorRate: number;
  errors: number;
  p50: number;
  p95: number;
  p99: number;
  byChain: (SplitRow & { color: string; icon?: string })[];
  byProvider: (SplitRow & { icon: string })[];
  byStatus: { code: string; label: string; count: number; pct: number; tone: 'success' | 'warning' | 'danger' }[];
  spark: { label: string; calls: number }[];
};

/** Sortable numeric columns on the endpoint table. */
export type EndpointSort = 'calls' | 'share' | 'cu' | 'cost' | 'errorRate' | 'p95';

/* ============================================================
   Generator
   ============================================================ */

function chainShare(chain: ChainFilter) {
  if (chain === 'all') return 1;
  return trafficChains.find((c) => c.id === chain)?.share ?? 1;
}

const isSolana = (chain: ChainFilter) => chain === 'solana';

function delta(now: number, prior: number, upIsGood: boolean): Delta {
  const pct = prior === 0 ? 0 : ((now - prior) / prior) * 100;
  return { pct, good: pct === 0 ? true : pct > 0 === upIsGood };
}

export type Snapshot = ReturnType<typeof build>;

function build(range: RangeId, chain: ChainFilter) {
  const bs = buckets(range);
  const labels = bs.map((b) => b.label);
  const key = `${range}:${chain}`;
  const hours = HOURS[range];
  const share = chainShare(chain);

  /* ---- totals ---- */
  // The last bucket of a sub-day range sits at the afternoon peak, so a 1h
  // window reads high against the flat hourly average. That is the point.
  const shapeAvg =
    range === '1d'
      ? bs.reduce((a, b) => a + diurnal(b.hod), 0) / bs.length
      : bs.reduce((a, b) => a + weekly(b.dow), 0) / bs.length;

  const requests = Math.round(PER_HOUR * hours * shapeAvg * share);
  const priorRequests = Math.round(requests / (1 + GROWTH[range]));

  const failed = Math.round(requests * ERROR_RATE);
  const ok = requests - failed;
  const priorFailed = Math.round(priorRequests * ERROR_RATE * 1.14);

  const cu = Math.round(requests * CU_PER_REQUEST);
  const priorCu = Math.round(priorRequests * CU_PER_REQUEST);
  const spend = (cu / 1_000_000) * PRICE_PER_MILLION_CU;
  const priorSpend = (priorCu / 1_000_000) * PRICE_PER_MILLION_CU;

  // Chains differ in how far they are from the nearest healthy node.
  const latencyBias = chain === 'all' ? 1 : 0.82 + (seedOf(chain) % 45) / 100;
  const p50 = Math.round(64 * latencyBias);
  const p95 = Math.round(151 * latencyBias);
  const p99 = Math.round(262 * latencyBias);
  const priorP50 = Math.round(p50 * 1.07);

  /* ---- traffic, split by endpoint group ---- */
  const w = weights(range, bs, `${key}:traffic`);
  const totals = spread(requests, w);
  // Split by request surface, taken off the endpoint table so the bands and the
  // rows below them are the same numbers.
  const groupShare = Object.fromEntries(
    SURFACES.map((s) => [
      s.id,
      ENDPOINTS.filter((e) => e.surface === s.id).reduce((a, e) => a + e.weight, 0),
    ]),
  ) as Record<SurfaceId, number>;
  const traffic: TrafficPoint[] = totals.map((t, i) => ({
    label: labels[i],
    unified: Math.round(t * groupShare.unified),
    rpc: Math.round(t * groupShare.rpc),
    direct: Math.round(t * groupShare.direct),
  }));

  /* ---- health ---- */
  const errNoise = rng(`${key}:errors`);
  const health: HealthPoint[] = totals.map((t, i) => {
    // Errors spike where load spikes, plus one deliberate incident.
    const incident = i === Math.floor(bs.length * 0.62) ? 6.4 : 1;
    const f = Math.round(t * ERROR_RATE * (0.6 + errNoise() * 0.9) * incident);
    return { label: labels[i], successful: t - f, failed: f };
  });

  /* ---- latency ---- */
  const latNoise = rng(`${key}:latency`);
  const latency: LatencyPoint[] = bs.map((b, i) => {
    const load = range === '1d' ? diurnal(b.hod) : weekly(b.dow);
    // Latency tracks load super-linearly: queueing, not bandwidth.
    const f = Math.pow(load, 1.35) * (0.96 + latNoise() * 0.08) * latencyBias;
    return {
      label: labels[i],
      p50: Math.round(p50 * f),
      p95: Math.round(p95 * f),
      p99: Math.round(p99 * f),
    };
  });

  /* ---- compute units ---- */
  const wssSplit = 0.187;
  const compute: ComputePoint[] = totals.map((t, i) => ({
    label: labels[i],
    http: Math.round(t * CU_PER_REQUEST * (1 - wssSplit)),
    wss: Math.round(t * CU_PER_REQUEST * wssSplit),
  }));

  /* ---- routing ---- */
  const failoverRate = 0.0212;
  const hedgeRate = 0.111;
  const foNoise = rng(`${key}:failover`);
  const routing: RoutingPoint[] = totals.map((t, i) => {
    // Rates apply to the routable slice only, not the whole bucket.
    const r = t * ROUTED_SHARE;
    const incident = i === Math.floor(bs.length * 0.62) ? 7.8 : 1;
    const failover = Math.round(r * failoverRate * (0.55 + foNoise() * 0.95) * incident);
    const hedged = Math.round(r * hedgeRate * (0.9 + foNoise() * 0.2));
    return { label: labels[i], primary: Math.round(r) - failover, failover, hedged };
  });

  const failedOver = routing.reduce((a, p) => a + p.failover, 0);
  const hedged = routing.reduce((a, p) => a + p.hedged, 0);
  const priorFailedOver = Math.round(failedOver / 1.31);

  /* ---- providers ---- */
  // Solana traffic can only go to the providers that serve it.
  const eligible = isSolana(chain)
    ? PROVIDER_MIX.filter((p) => ['helius', 'quicknode', 'alchemy', 'ankr'].includes(p.id))
    : PROVIDER_MIX;
  const eligibleTotal = eligible.reduce((a, p) => a + p.share, 0);

  // A provider wins a scored race on speed and reliability, not on how much
  // traffic it already carries, so this is derived from latency, and the two
  // rankings deliberately disagree. The fastest upstream is often not the one
  // serving the most calls, because coverage decides who is eligible at all.
  const fastest = Math.min(...eligible.map((p) => p.p50));
  const providerStats: ProviderStat[] = eligible.map((p) => {
    const s = p.share / eligibleTotal;
    const meta = providerById.get(p.id);
    const speed = fastest / p.p50;
    const reliability = 1 - p.errorRate * 4;
    return {
      id: p.id,
      name: meta?.name ?? p.id,
      icon: `/assets/icons/providers/${p.icon}`,
      requests: Math.round(requests * s),
      share: s * 100,
      p50: Math.round(p.p50 * latencyBias),
      p95: Math.round(p.p95 * latencyBias),
      errorRate: p.errorRate * 100,
      uptime: meta?.uptime ?? 99.9,
      status: meta?.status ?? 'operational',
      winRate: Math.round(Math.max(4, Math.min(94, speed * reliability * 94))),
    };
  });

  /* ---- failover log ---- */
  const chainPool = chain === 'all' ? trafficChains.map((c) => c.name) : [
    trafficChains.find((c) => c.id === chain)?.name ?? 'Ethereum',
  ];
  const reasons = [
    'Upstream 5xx burst',
    'p95 breached 400 ms',
    'Rate limit (429)',
    'Connection reset',
    'Stale block height',
    'TLS handshake timeout',
  ];
  const fNoise = rng(`${key}:folog`);
  const failovers: FailoverEvent[] = Array.from({ length: 6 }, (_, i) => {
    const fromIdx = Math.floor(fNoise() * eligible.length);
    let toIdx = Math.floor(fNoise() * eligible.length);
    if (toIdx === fromIdx) toIdx = (toIdx + 1) % eligible.length;
    const ms = NOW - Math.round(fNoise() * hours * HOUR);
    return {
      id: `fo${i}`,
      ms,
      from: providerById.get(eligible[fromIdx].id)?.name ?? eligible[fromIdx].id,
      to: providerById.get(eligible[toIdx].id)?.name ?? eligible[toIdx].id,
      reason: reasons[Math.floor(fNoise() * reasons.length)],
      chain: chainPool[Math.floor(fNoise() * chainPool.length)],
      requests: Math.round(40 + fNoise() * (failedOver / 6)),
      recoveredMs: Math.round(80 + fNoise() * 340),
    };
  })
    // A log reads newest first. Sorting it by size would make it a chart.
    .sort((a, b) => b.ms - a.ms)
    .map(({ ms, ...f }) => {
      const d = new Date(ms);
      // Every window here is at least a day, so all of them can cross midnight:
      // a bare clock time would read as out of order even when the rows are
      // sorted. The date always leads.
      const at = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
      return { ...f, at };
    });

  /* ---- chain mix ---- */
  const chainMix = (chain === 'all' ? trafficChains : trafficChains.filter((c) => c.id === chain)).map(
    (c) => ({
      id: c.id,
      name: c.name,
      calls: Math.round(requests * (chain === 'all' ? c.share : 1)),
      share: chain === 'all' ? c.share * 100 : 100,
      color: chainColor(c.id),
      icon: chainIcon(c.id),
    }),
  );

  /* ---- status codes ---- */
  const c4 = Math.round(failed * 0.79);
  const c5 = failed - c4;
  const statusCodes = [
    { code: '2xx', label: 'Success', count: ok, tone: 'success' as const },
    { code: '4xx', label: 'Client error', count: c4, tone: 'warning' as const },
    { code: '5xx', label: 'Server error', count: c5, tone: 'danger' as const },
  ].map((s) => ({ ...s, pct: Math.round((s.count / requests) * 1000) / 10 }));

  /* ---- endpoints, with the drill-down each row opens ---- */
  // Built after the chain and provider splits so a single endpoint's breakdown
  // is a tilt of the project-wide one rather than an unrelated set of numbers.
  // Every split here re-normalises to the endpoint's own call count, so the
  // detail always sums back to the row that opened it.
  const endpoints: EndpointStat[] = ENDPOINTS.map((e) => {
    const eNoise2 = rng(`${key}:ep:${e.name}`);
    const calls = Math.round(requests * e.weight);

    // Heavier calls fail more: more upstream work, more to time out.
    const errorRate = Math.min(9, ERROR_RATE * 100 * (0.34 + e.cu * 0.13) * (0.8 + eNoise2() * 0.5));
    const errors = Math.round((calls * errorRate) / 100);

    const lat = (0.55 + e.cu * 0.14) * (0.9 + eNoise2() * 0.25) * latencyBias;

    // Tilt a shared split toward this endpoint, then re-normalise.
    const tilt = <T extends { share: number }>(rows: T[], strength: number) => {
      const w = rows.map((r) => Math.max(0.01, r.share * (1 - strength / 2 + eNoise2() * strength)));
      const sum = w.reduce((x, y) => x + y, 0);
      return rows.map((r, i) => ({ ...r, share: (w[i] / sum) * 100 }));
    };

    // Re-sorted after tilting. The project-wide order no longer holds once each
    // endpoint's mix is skewed, and an unsorted bar list reads as broken.
    const byChain = tilt(chainMix.map((c) => ({ ...c, share: c.share })), 1.1)
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        icon: c.icon,
        calls: Math.round(calls * (c.share / 100)),
        share: c.share,
      }))
      .sort((x, y) => y.calls - x.calls);

    // A direct call names its vendor in the path, so there is no mix to show:
    // one provider served all of it, by construction rather than by scoring.
    const byProvider = e.pinned
      ? [
          {
            id: e.pinned.toLowerCase(),
            name: e.pinned,
            icon: `/assets/icons/providers/${DIRECT_ICONS[e.pinned]}`,
            calls,
            share: 100,
          },
        ]
      : tilt(providerStats.map((p) => ({ ...p, share: p.share })), 0.8)
          .map((p) => ({
            id: p.id,
            name: p.name,
            icon: p.icon,
            calls: Math.round(calls * (p.share / 100)),
            share: p.share,
          }))
          .sort((x, y) => y.calls - x.calls);

    const e4 = Math.round(errors * 0.79);
    const byStatus = [
      { code: '2xx', label: 'Success', count: calls - errors, tone: 'success' as const },
      { code: '4xx', label: 'Client error', count: e4, tone: 'warning' as const },
      { code: '5xx', label: 'Server error', count: errors - e4, tone: 'danger' as const },
    ].map((s) => ({ ...s, pct: (s.count / calls) * 100 }));

    return {
      name: e.name,
      surface: e.surface,
      /** Vendor this call is locked to. Only ever set on the direct surface. */
      pinned: e.pinned,
      method: e.surface === 'rpc' ? 'POST' : 'GET',
      calls,
      share: e.weight * 100,
      cuPerCall: e.cu,
      cu: calls * e.cu,
      cost: ((calls * e.cu) / 1_000_000) * PRICE_PER_MILLION_CU,
      errorRate,
      errors,
      p50: Math.round(p50 * lat),
      p95: Math.round(p95 * lat),
      p99: Math.round(p99 * lat),
      byChain,
      byProvider,
      byStatus,
      // Per-bucket call volume, for the sparkline in the expanded row.
      spark: totals.map((t, i) => ({ label: labels[i], calls: Math.round(t * e.weight) })),
    };
  });

  const topCalls = endpoints[0].calls;

  /* ---- JSON-RPC ---- */
  const rpcEndpoints = endpoints.filter((e) => e.surface === 'rpc');
  const rpcTotal = rpcEndpoints.reduce((a, e) => a + e.calls, 0);
  // Derived from the endpoint table so the Methods chart carries the same
  // per-method stats the endpoint drill-down does, and its tooltip can show
  // them rather than a bare call count.
  const rpcMethods = isSolana(chain)
    ? SOLANA_METHODS.map((m, i) => {
        // Solana speaks a different method vocabulary; reuse the EVM rows'
        // shape so the chart and its tooltip keep working.
        const base = rpcEndpoints[i % rpcEndpoints.length];
        const calls = Math.round(rpcTotal * m.weight);
        return {
          ...base,
          name: m.name,
          calls,
          share: (calls / requests) * 100,
          cu: calls * base.cuPerCall,
          cost: ((calls * base.cuPerCall) / 1_000_000) * PRICE_PER_MILLION_CU,
        };
      })
    : rpcEndpoints;
  const rpcChains = chainMix.map((c) => ({
    ...c,
    calls: Math.round(rpcTotal * (c.share / 100)),
  }));
  const rpcOk = Math.round(rpcTotal * 0.997);
  const rpcBatch = [
    { label: 'Batched', value: 38, color: 'var(--ub-blue)' },
    { label: 'Single', value: 62, color: 'var(--ub-border)' },
  ];

  /* ---- websockets ---- */
  const wsNoise = rng(`${key}:ws`);
  const wsBase = 1240 * share;
  const wsSeries: WsPoint[] = bs.map((b, i) => {
    const load = range === '1d' ? diurnal(b.hod) : weekly(b.dow);
    const connections = Math.round(wsBase * load * (0.95 + wsNoise() * 0.1));
    return {
      label: labels[i],
      connections,
      // Each socket pushes on new blocks plus whatever logs it matched.
      messages: Math.round(connections * (14 + wsNoise() * 5)),
    };
  });
  // Each point is a bucket average, so the true instantaneous peak sits above
  // the highest bucket. Reporting the bucket max as "peak" would understate the
  // number the plan ceiling is actually measured against.
  const wsPeak = Math.round(Math.max(...wsSeries.map((p) => p.connections)) * 1.07);
  const wsCurrent = wsSeries[wsSeries.length - 1].connections;
  const wsAvg = wsSeries.reduce((a, p) => a + p.connections, 0) / wsSeries.length;
  const wsLimit = 4000;
  const wsMessages = wsSeries.reduce((a, p) => a + p.messages, 0);

  const subsTable = isSolana(chain)
    ? [
        { name: 'accountSubscribe', weight: 0.44 },
        { name: 'logsSubscribe', weight: 0.27 },
        { name: 'slotSubscribe', weight: 0.19 },
        { name: 'signatureSubscribe', weight: 0.1 },
      ]
    : [
        { name: 'newHeads', weight: 0.41 },
        { name: 'logs', weight: 0.34 },
        { name: 'newPendingTransactions', weight: 0.17 },
        { name: 'syncing', weight: 0.08 },
      ];
  const totalSubs = Math.round(wsCurrent * 2.4);
  const wsSubscriptions = subsTable.map((s) => ({
    name: s.name,
    count: Math.round(totalSubs * s.weight),
    share: s.weight * 100,
  }));

  // Little's law: the number of sockets opened over a window follows from how
  // many are held at once and how long each one lives. Picking these three
  // independently is how a lifecycle panel ends up contradicting itself.
  const avgSession = 18.4;
  const opened = Math.round((wsAvg * hours * 60) / avgSession);
  const dropped = Math.round(opened * 0.041);
  const wsLifecycle = {
    opened,
    closed: opened - dropped,
    dropped,
    reconnects: Math.round(dropped * 1.28),
    /** Minutes. */
    avgSession,
    p95Session: 71.2,
    /** Sockets Uniblock re-established on a different provider without the client noticing. */
    rescued: Math.round(dropped * 0.86),
  };

  const wsProviders = providerStats.slice(0, 4).map((p, i) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    sockets: Math.round(wsCurrent * [0.38, 0.29, 0.2, 0.13][i]),
    share: [38, 29, 20, 13][i],
    dropRate: [0.6, 0.9, 1.4, 3.8][i],
  }));

  /* ---- cost ---- */
  const cuByEndpoint = endpoints
    .map((e) => ({ name: e.name, cu: e.cu, perCall: e.cuPerCall }))
    .sort((a, b) => b.cu - a.cu);
  const cuTotal = cuByEndpoint.reduce((a, e) => a + e.cu, 0);

  const cuBreakdown = [
    { name: 'Unified API', cu: Math.round(cu * 0.553) },
    { name: 'JSON-RPC', cu: Math.round(cu * 0.32) },
    { name: 'WebSocket', cu: Math.round(cu * 0.087) },
    { name: 'Webhooks', cu: Math.round(cu * 0.04) },
  ];

  // What the same traffic costs buying each provider directly, at their list
  // price, with no pooled commitment.
  const directCost = eligible.map((p) => {
    const meta = providerById.get(p.id);
    return {
      id: p.id,
      name: meta?.name ?? p.id,
      icon: `/assets/icons/providers/${p.icon}`,
      cost: (cu / 1_000_000) * DIRECT_LIST_PRICE[p.id],
    };
  });
  // Buying direct means buying every provider you route to, not just the
  // cheapest one. That is the whole reason the comparison is worth drawing.
  const multiVendorCost = eligible.reduce((a, p) => {
    // Each vendor is bought at its own list price for the share it serves,
    // and each carries a floor you pay whether you use it or not.
    const vendorCu = cu * (p.share / eligibleTotal);
    return a + (vendorCu / 1_000_000) * DIRECT_LIST_PRICE[p.id];
  }, 0);
  const vendorFloors = eligible.length * (range === '30d' ? 49 : range === '7d' ? 11.4 : hours * 0.068);

  const burnPerDay = cu / (hours / 24);
  const cuLimit = 40_000_000;
  const cuMonth = Math.round(PER_HOUR * 720 * CU_PER_REQUEST * chainShare('all'));
  const daysToLimit = Math.max(0, Math.round((cuLimit - cuMonth) / (cuMonth / 30)));

  /* ---- throughput against the plan ceiling ----
     A rate limit is a burst problem, not a monthly one, so this window is fixed
     at six hours of five-minute buckets no matter which range is selected: a
     month of five-minute peaks is 8,640 points nobody can read, and averaging
     them away would hide the exact spikes the ceiling is about.

     Each point is the highest requests-per-second seen inside that bucket, so a
     peak far above the window's average is normal and not a contradiction. */
  const THROUGHPUT_HOURS = 6;
  const BUCKET_MIN = 5;
  const planRps = 25;
  const tNoise = rng(`${key}:throughput`);
  const tBuckets = (THROUGHPUT_HOURS * 60) / BUCKET_MIN;
  const throughputSeries = Array.from({ length: tBuckets }, (_, i) => {
    const ms = NOW - (tBuckets - 1 - i) * BUCKET_MIN * MIN;
    const d = new Date(ms);
    const load = diurnal(d.getUTCHours() + d.getUTCMinutes() / 60);
    // Two seeded bursts, so the ceiling has something to be near.
    const burst = i === 21 ? 2.55 : i === 52 ? 2.72 : i === 53 ? 1.9 : 1;
    const rps = Math.max(1, Math.round(6.4 * load * burst * (0.78 + tNoise() * 0.5)));
    return { label: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`, rps };
  });
  const peak = throughputSeries.reduce((a, b) => (b.rps > a.rps ? b : a));
  const overBuckets = throughputSeries.filter((b) => b.rps > planRps);
  /* The series is what the client *attempted*. Served throughput cannot exceed
     the ceiling by definition, so the area above the line is not traffic you
     handled: it is the 429s. Counting them as (excess rps x bucket seconds) is
     what makes the rejection figure agree with the shape of the chart. */
  const throttled = Math.round(
    overBuckets.reduce((n, b) => n + (b.rps - planRps) * BUCKET_MIN * 60, 0),
  );

  const throughput = {
    planName: 'Free',
    planRps,
    bucketMinutes: BUCKET_MIN,
    windowHours: THROUGHPUT_HOURS,
    series: throughputSeries,
    peakRps: peak.rps,
    peakAt: peak.label,
    /** How much of the ceiling the busiest bucket left unused, 0 once it is over. */
    headroomPct: Math.max(0, (1 - peak.rps / planRps) * 100),
    /** How far past the ceiling the busiest bucket went. */
    overByRps: Math.max(0, peak.rps - planRps),
    /** Buckets that went over the limit. */
    atCeiling: overBuckets.length,
    throttled,
    /** The next plan's ceiling, for the upgrade line. */
    nextPlan: { name: 'Startup', rps: 250 },
  };

  const cost = {
    spend,
    priorSpend,
    perMillion: PRICE_PER_MILLION_CU,
    burnPerDay,
    projectedMonth: (cuMonth / 1_000_000) * PRICE_PER_MILLION_CU,
    daysToLimit,
    cuLimit,
    cuMonth,
    multiVendorCost: multiVendorCost + vendorFloors,
    vendorFloors,
    vendorCount: eligible.length,
    directCost: directCost.sort((a, b) => b.cost - a.cost),
    cuByEndpoint,
    cuTotal,
    cuBreakdown,
  };

  /* ---- errors ---- */
  // `upstream` decides whether a provider is named: a malformed address or a
  // revoked key is your caller's doing, and blaming an upstream for it sends
  // whoever reads this table to the wrong place.
  const errTable = [
    { code: 429, name: 'Too Many Requests', message: 'Upstream provider rate limit reached', weight: 0.31, absorbed: true, upstream: true },
    { code: 502, name: 'Bad Gateway', message: 'Upstream returned an unparseable response', weight: 0.19, absorbed: true, upstream: true },
    { code: 400, name: 'Bad Request', message: 'Invalid address checksum in `address`', weight: 0.17, absorbed: false, upstream: false },
    { code: 504, name: 'Gateway Timeout', message: 'Upstream exceeded the 10s budget', weight: 0.12, absorbed: true, upstream: true },
    { code: 404, name: 'Not Found', message: 'Token contract not indexed on this chain', weight: 0.11, absorbed: false, upstream: true },
    { code: 401, name: 'Unauthorized', message: 'API key missing or revoked', weight: 0.06, absorbed: false, upstream: false },
    { code: 500, name: 'Internal Error', message: 'Response normalisation failed', weight: 0.04, absorbed: false, upstream: false },
  ];
  const eNoise = rng(`${key}:errtable`);
  const errors: ErrorRow[] = errTable.map((e, i) => {
    const ms = NOW - Math.round(eNoise() * hours * HOUR * 0.4);
    const d = new Date(ms);
    return {
      id: `e${i}`,
      code: e.code,
      name: e.name,
      message: e.message,
      endpoint: ENDPOINTS[Math.floor(eNoise() * ENDPOINTS.length)].name,
      chain: chainPool[Math.floor(eNoise() * chainPool.length)],
      provider: e.upstream
        ? providerById.get(eligible[Math.floor(eNoise() * eligible.length)].id)?.name ?? 'Alchemy'
        : '—',
      count: Math.round(failed * e.weight),
      share: e.weight * 100,
      lastSeen: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
      absorbed: e.absorbed,
    };
  });

  const rNoise = rng(`${key}:recent`);
  // Walk backwards from now with an accumulating offset. Multiplying a fresh
  // random gap by the row index instead lets a later row land earlier, which
  // shuffles a log that has to read newest-first.
  let cursor = NOW;
  const recentFailures: FailedRequest[] = Array.from({ length: 8 }, (_, i) => {
    const e = errTable[Math.floor(rNoise() * errTable.length)];
    const ep = ENDPOINTS[Math.floor(rNoise() * ENDPOINTS.length)];
    cursor -= Math.round(7000 + rNoise() * 26000);
    const d = new Date(cursor);
    return {
      id: `rf${i}`,
      ts: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
      method: ep.name.startsWith('eth_') ? 'POST' : 'GET',
      endpoint: ep.name,
      chain: chainPool[Math.floor(rNoise() * chainPool.length)],
      status: e.code,
      latencyMs: Math.round(12 + rNoise() * 900),
      provider: e.upstream
        ? providerById.get(eligible[Math.floor(rNoise() * eligible.length)].id)?.name ?? 'Alchemy'
        : '—',
      attempts: e.absorbed ? 2 + Math.floor(rNoise() * 2) : 1,
    };
  });

  const absorbed = errors.filter((e) => e.absorbed).reduce((a, e) => a + e.count, 0);

  /* ---- slowest endpoints ---- */
  // Read off `endpoints` rather than recomputed. Generating these percentiles a
  // second time would make the Latency tab disagree with the drill-down on the
  // Endpoints tab for the same endpoint, which is worse than not showing them.
  const slowest: SlowEndpoint[] = [...endpoints]
    .sort((a, b) => b.p95 - a.p95)
    .slice(0, 6)
    .map((e) => ({ name: e.name, p50: e.p50, p95: e.p95, p99: e.p99, calls: e.calls }));

  return {
    range,
    chain,
    labels,

    totals: { requests, ok, failed, errorRate: (failed / requests) * 100, p50, p95, p99, cu, spend },
    deltas: {
      requests: delta(requests, priorRequests, true),
      errorRate: delta(failed / requests, priorFailed / priorRequests, false),
      p50: delta(p50, priorP50, false),
      cu: delta(cu, priorCu, true),
      spend: delta(spend, priorSpend, false),
      failedOver: delta(failedOver, priorFailedOver, false),
    },

    traffic,
    health,
    latency,
    compute,
    routing,
    wsSeries,

    endpoints,
    /** Bar width is relative to the busiest endpoint, not to the whole window. */
    topCalls,
    chainMix,
    statusCodes,

    rpcMethods,
    rpcChains,
    rpcBatch,
    rpcTotal,
    rpcOk,
    rpcFailed: rpcTotal - rpcOk,

    providers: providerStats,
    routingSummary: {
      // Only the unified and JSON-RPC surfaces are routable. Direct calls name
      // their vendor, so counting them here would understate the failover rate
      // by diluting it with traffic that was never eligible to be re-routed.
      routed: Math.round(requests * ROUTED_SHARE),
      pinned: requests - Math.round(requests * ROUTED_SHARE),
      pinnedPct: (1 - ROUTED_SHARE) * 100,
      failedOver,
      hedged,
      absorbed,
      /** Latency saved against always using the slowest eligible provider. */
      savedMs: Math.round(
        (eligible.reduce((a, p) => a + p.p50, 0) / eligible.length - p50 / latencyBias) * latencyBias,
      ),
      providerCount: eligible.length,
      degraded: providerStats.filter((p) => p.status === 'degraded').length,
      /**
       * The shape of one rescued request: how long the failing upstream was
       * given before the router gave up on it, and how long the provider that
       * actually answered took. A re-route is not free, and a panel that only
       * counts the saves is telling half the story: the other half is that
       * these calls came back slow, and came back.
       */
      retry: {
        /** Detection budget: the failing attempt, up to the health cutoff. */
        firstMs: Math.round(p95 * 1.2),
        /** The second lane, served by the fastest healthy provider. */
        secondMs: Math.round(Math.min(...providerStats.map((p) => p.p50))),
        /** What the same call costs when the first choice answers. */
        baselineMs: p50,
      },
    },
    failovers,

    ws: {
      current: wsCurrent,
      peak: wsPeak,
      limit: wsLimit,
      messages: wsMessages,
      subscriptions: totalSubs,
      lifecycle: wsLifecycle,
      byType: wsSubscriptions,
      byProvider: wsProviders,
    },

    cost,
    throughput,
    errors,
    recentFailures,
    slowest,
  };
}

/* ============================================================
   Cache
   ============================================================ */

const cache = new Map<string, Snapshot>();

/** Memoised so a re-render never re-rolls the noise or re-does the arithmetic. */
export function analytics(range: RangeId, chain: ChainFilter): Snapshot {
  const key = `${range}:${chain}`;
  let snap = cache.get(key);
  if (!snap) {
    snap = build(range, chain);
    cache.set(key, snap);
  }
  return snap;
}

/* ============================================================
   Formatters
   ============================================================ */

export const fmtCount = (n: number) => n.toLocaleString('en-US');

export function fmtCompact(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}

export const fmtMoney = (n: number) =>
  n >= 1000
    ? `$${Math.round(n).toLocaleString('en-US')}`
    : `$${n.toFixed(2)}`;

export const fmtPct = (n: number, dp = 1) => `${n.toFixed(dp)}%`;

export const fmtMs = (n: number) => `${Math.round(n)} ms`;
