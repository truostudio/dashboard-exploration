import { docChains, docNetworkCount } from './chains';
import type { ChainCategory } from './chains';

export type Project = {
  id: string;
  name: string;
  network: string;
  env: 'prod' | 'dev' | 'staging';
};

export const projects: Project[] = [
  { id: 'eth-mainnet-prod', name: 'eth-mainnet', network: 'Ethereum', env: 'prod' },
  { id: 'multi-chain-dev', name: 'multi-chain', network: 'Multi', env: 'dev' },
  { id: 'sol-trade-prod', name: 'sol-trade', network: 'Solana', env: 'prod' },
];

export type EndpointCategory =
  | 'all'
  | 'json-rpc'
  | 'market'
  | 'nft'
  | 'scan'
  | 'token'
  | 'transaction'
  | 'defi'
  | 'social'
  | 'direct'
  | 'prediction'
  | 'stablecoin';

export type Endpoint = {
  method: 'GET' | 'POST' | 'WS';
  path: string;
  description: string;
  category: Exclude<EndpointCategory, 'all'>;
  badge?: 'new';
};

export const endpoints: Endpoint[] = [
  { method: 'GET', path: '/token/balance', description: 'Token balance for a wallet address', category: 'token' },
  { method: 'GET', path: '/nft/metadata', description: 'Metadata and attributes for a single NFT', category: 'nft' },
  { method: 'GET', path: '/transaction/lookup', description: 'Look up a transaction by hash', category: 'transaction' },
  { method: 'GET', path: '/market/price', description: 'Real-time token price from aggregated sources', category: 'market' },
  { method: 'POST', path: '/defi/swap-quote', description: 'DEX swap quote across liquidity sources', category: 'defi' },
  { method: 'POST', path: 'eth_sendRawTransaction', description: 'Broadcast a signed transaction to the network', category: 'json-rpc' },
  { method: 'POST', path: 'eth_call', description: 'Read-only call against a contract', category: 'json-rpc' },
  { method: 'POST', path: 'eth_getBalance', description: 'Get the ETH balance of an account', category: 'json-rpc' },
  { method: 'GET', path: '/scan/contract', description: 'Verified contract source and ABI', category: 'scan' },
  { method: 'GET', path: '/social/profile', description: 'Lens / Farcaster profile lookup', category: 'social', badge: 'new' },
  { method: 'GET', path: '/prediction/markets', description: 'Active markets across Polymarket and others', category: 'prediction', badge: 'new' },
  { method: 'GET', path: '/stablecoin/supply', description: 'Circulating supply per stablecoin per chain', category: 'stablecoin', badge: 'new' },
];

export type Provider = {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded';
  uptime: number;
  latencyMs: number;
  docsUrl: string;
  icon?: string;
};

const providerIcon = (file: string) => `/assets/icons/providers/${file}`;

/**
 * The provider directory, verbatim from
 * https://docs.uniblock.dev/reference/resources/providers, all 33, with the
 * docs' own one-line description and first-party documentation link.
 *
 * Status, uptime and latency are the one thing the docs cannot supply: they are
 * this project's telemetry, so they are generated deterministically per id and
 * are stable across renders rather than random.
 */
export const providers: Provider[] = [
  { id: 'alchemy', name: 'Alchemy', description: 'Blockchain developer platform for apps, wallets, rollups, and onchain data.', status: 'operational', uptime: 99.94, latencyMs: 120, docsUrl: 'https://docs.alchemy.com/reference/api-overview', icon: providerIcon('Alchemy.webp') },
  { id: 'allthatnode', name: 'AllThatNode', description: 'Multi-chain node and API infrastructure for blockchain builders and applications.', status: 'operational', uptime: 99.81, latencyMs: 124, docsUrl: 'https://docs.allthatnode.com/', icon: providerIcon('AllThatNode.webp') },
  { id: 'ankr', name: 'Ankr', description: 'Web3 infrastructure for RPC, rollups, staking, and multichain app development.', status: 'operational', uptime: 99.65, latencyMs: 88, docsUrl: 'https://www.ankr.com/docs/', icon: providerIcon('Ankr.webp') },
  { id: 'birdeye', name: 'Birdeye', description: 'Digital asset data platform for token, wallet, and onchain market intelligence.', status: 'operational', uptime: 99.75, latencyMs: 69, docsUrl: 'https://docs.birdeye.so/docs/overview', icon: providerIcon('Birdeye.webp') },
  { id: 'blockdaemon', name: 'BlockDaemon', description: 'Blockchain infrastructure platform for node access, APIs, staking, and protocol connectivity.', status: 'operational', uptime: 99.8, latencyMs: 68, docsUrl: 'https://docs.blockdaemon.com/', icon: providerIcon('Blockdaemon.webp') },
  { id: 'chainstack', name: 'Chainstack', description: 'Managed blockchain infrastructure and node services for web3 teams.', status: 'operational', uptime: 99.8, latencyMs: 72, docsUrl: 'https://docs.chainstack.com/', icon: providerIcon('Chainstack.webp') },
  { id: 'coingecko', name: 'CoinGecko', description: 'Independent crypto data platform for prices, market data, NFTs, exchanges, and onchain analytics.', status: 'operational', uptime: 99.97, latencyMs: 98, docsUrl: 'https://docs.coingecko.com/reference/introduction', icon: providerIcon('CoinGecko.webp') },
  { id: 'coinmarketcap', name: 'CoinMarketCap', description: 'Cryptocurrency market data platform for prices, listings, rankings, and research.', status: 'operational', uptime: 99.88, latencyMs: 110, docsUrl: 'https://coinmarketcap.com/api/documentation/v1/', icon: providerIcon('CoinMarketCap.webp') },
  { id: 'goldrush', name: 'GoldRush', description: 'Unified blockchain data infrastructure for wallet, token, NFT, and transaction use cases.', status: 'operational', uptime: 99.85, latencyMs: 113, docsUrl: 'https://goldrush.mintlify.app/api-reference/overview', icon: providerIcon('GoldRush.svg') },
  { id: 'cryptocompare', name: 'CryptoCompare', description: 'Digital asset market data and index provider for pricing, analytics, and benchmarks.', status: 'operational', uptime: 99.79, latencyMs: 55, docsUrl: 'https://developers.cryptocompare.com/', icon: providerIcon('CryptoCompare.webp') },
  { id: 'defined', name: 'Defined', description: 'Onchain market data platform for tokens, DEXs, liquidity, and trading analytics.', status: 'operational', uptime: 99.52, latencyMs: 68, docsUrl: 'https://docs.defined.fi/reference/overview', icon: providerIcon('Defined.webp') },
  { id: 'drpc', name: 'dRPC / DRPC', description: 'Distributed RPC infrastructure for fast, resilient blockchain access.', status: 'operational', uptime: 99.96, latencyMs: 121, docsUrl: 'https://drpc.org/docs' },
  { id: 'dwellir', name: 'Dwellir', description: 'Web3 infrastructure platform for RPC access and blockchain node services.', status: 'operational', uptime: 99.94, latencyMs: 142, docsUrl: 'https://www.dwellir.com/docs' },
  { id: 'etherscan', name: 'EtherScan', description: 'Blockchain explorer and API platform for onchain search, contracts, and transaction data.', status: 'operational', uptime: 99.78, latencyMs: 111, docsUrl: 'https://docs.etherscan.io/', icon: providerIcon('EtherScan.webp') },
  { id: 'geniidata', name: 'GeniiData', description: 'Blockchain data platform for accessing onchain and ecosystem-specific data APIs.', status: 'degraded', uptime: 99.95, latencyMs: 106, docsUrl: 'https://geniidata.readme.io/reference/introduction', icon: providerIcon('GeniiData.webp') },
  { id: 'helius', name: 'Helius', description: 'Solana developer platform for RPC, data, webhooks, and real-time infrastructure.', status: 'operational', uptime: 99.63, latencyMs: 149, docsUrl: 'https://docs.helius.dev/', icon: providerIcon('Helius.webp') },
  { id: 'hellomoon', name: 'HelloMoon', description: 'Solana data and analytics platform for applications, traders, and protocols.', status: 'operational', uptime: 99.7, latencyMs: 59, docsUrl: 'https://docs.hellomoon.io/', icon: providerIcon('HelloMoon.webp') },
  { id: 'infura', name: 'Infura', description: 'Web3 infrastructure and API access for building decentralized applications at scale.', status: 'operational', uptime: 99.6, latencyMs: 122, docsUrl: 'https://docs.infura.io/', icon: providerIcon('Infura.webp') },
  { id: 'lunarcrush', name: 'LunarCrush', description: 'Social intelligence platform for crypto sentiment, creators, and market signals.', status: 'operational', uptime: 99.78, latencyMs: 117, docsUrl: 'https://lunarcrush.com/developers/api/endpoints', icon: providerIcon('LunarCrush.webp') },
  { id: 'magiceden', name: 'MagicEden', description: 'Digital asset marketplace and trading platform for NFTs and tokens.', status: 'operational', uptime: 99.7, latencyMs: 76, docsUrl: 'https://docs.magiceden.io/', icon: providerIcon('MagicEden.webp') },
  { id: 'mempool', name: 'Mempool', description: 'Bitcoin mempool explorer and API for fees, transactions, blocks, and network activity.', status: 'operational', uptime: 99.64, latencyMs: 75, docsUrl: 'https://mempool.space/docs/api/rest', icon: providerIcon('Mempool.webp') },
  { id: 'moralis', name: 'Moralis', description: 'Web3 development platform for wallet, token, NFT, and blockchain data APIs.', status: 'operational', uptime: 99.66, latencyMs: 122, docsUrl: 'https://docs.moralis.com/', icon: providerIcon('Moralis.webp') },
  { id: 'nodies', name: 'Nodies', description: 'Multi-chain RPC and node infrastructure for web3 developers and products.', status: 'operational', uptime: 99.61, latencyMs: 152, docsUrl: 'https://docs.nodies.app/', icon: providerIcon('Nodies.webp') },
  { id: 'onfinality', name: 'OnFinality', description: 'Blockchain infrastructure and API platform for scalable web3 connectivity.', status: 'operational', uptime: 99.5, latencyMs: 116, docsUrl: 'https://documentation.onfinality.io/' },
  { id: 'pokt', name: 'Pokt', description: 'Decentralized infrastructure network for RPC and blockchain data access.', status: 'operational', uptime: 99.79, latencyMs: 62, docsUrl: 'https://docs.pokt.network/', icon: providerIcon('Pokt.webp') },
  { id: 'polymarket', name: 'Polymarket', description: 'Prediction markets platform for event-based trading and market probabilities.', status: 'operational', uptime: 99.95, latencyMs: 69, docsUrl: 'https://docs.polymarket.com/', icon: providerIcon('Polymarket.webp') },
  { id: 'quicknode', name: 'QuickNode', description: 'Blockchain infrastructure platform for RPC, APIs, and developer tooling.', status: 'operational', uptime: 99.66, latencyMs: 116, docsUrl: 'https://www.quicknode.com/docs/', icon: providerIcon('QuickNode.webp') },
  { id: 'shyft', name: 'Shyft', description: 'Solana development platform with APIs, RPCs, and callback infrastructure.', status: 'operational', uptime: 99.77, latencyMs: 72, docsUrl: 'https://docs.shyft.to/', icon: providerIcon('Shyft.webp') },
  { id: 'solscan', name: 'SolScan', description: 'Solana explorer and data platform for accounts, tokens, NFTs, and transactions.', status: 'operational', uptime: 99.84, latencyMs: 90, docsUrl: 'https://pro-api.solscan.io/pro-api-docs/v2.0', icon: providerIcon('SolScan.webp') },
  { id: 'tatum', name: 'Tatum', description: 'Blockchain development platform with unified APIs, infrastructure, and wallet tooling.', status: 'operational', uptime: 99.98, latencyMs: 125, docsUrl: 'https://docs.tatum.io/', icon: providerIcon('Tatum.webp') },
  { id: 'thirdweb', name: 'Thirdweb', description: 'Full-stack web3 development platform for onchain apps and user experiences.', status: 'operational', uptime: 99.76, latencyMs: 153, docsUrl: 'https://portal.thirdweb.com/', icon: providerIcon('Thirdweb.webp') },
  { id: 'tonapi', name: 'TonAPI', description: 'API platform for TON blockchain data, accounts, tokens, NFTs, and transactions.', status: 'operational', uptime: 99.9, latencyMs: 123, docsUrl: 'https://docs.tonconsole.com/tonapi/api-v2', icon: providerIcon('TonAPI.webp') },
  { id: 'zerion', name: 'Zerion', description: 'Wallet and portfolio platform for tracking and interacting with onchain assets.', status: 'operational', uptime: 99.68, latencyMs: 67, docsUrl: 'https://developers.zerion.io/reference/endpoints-and-schema-details' },
];

export type Chain = {
  id: string;
  name: string;
  symbol: string;
  chainId: string | number;
  icon: string;
  category: ChainCategory;
  /** Only the chains the app already had brand artwork for carry a colour. */
  color?: string;
};

/**
 * The chain directory is the docs' chain list, not a hand-picked sample: all 83
 * chains with a published JSON-RPC reference. `docChains` already carries the
 * shape this app wants, so this is a re-export rather than a second copy that
 * can drift.
 */
export const chains: Chain[] = docChains;

export type RecentRequest = {
  id: string;
  ts: string;
  method: 'GET' | 'POST';
  endpoint: string;
  chain: string;
  status: number;
  latencyMs: number;
  provider: string;
};

export const recentRequests: RecentRequest[] = [
  { id: 'r1', ts: '14:21:08', method: 'GET',  endpoint: '/token/balance',         chain: 'Ethereum', status: 200, latencyMs: 64,  provider: 'Alchemy'    },
  { id: 'r2', ts: '14:21:02', method: 'POST', endpoint: 'eth_call',               chain: 'Base',     status: 200, latencyMs: 48,  provider: 'QuickNode'  },
  { id: 'r3', ts: '14:20:57', method: 'GET',  endpoint: '/nft/metadata',          chain: 'Polygon',  status: 200, latencyMs: 112, provider: 'Alchemy'    },
  { id: 'r4', ts: '14:20:51', method: 'POST', endpoint: 'eth_getBalance',         chain: 'Arbitrum', status: 200, latencyMs: 38,  provider: 'Infura'     },
  { id: 'r5', ts: '14:20:44', method: 'GET',  endpoint: '/market/price',          chain: 'Solana',   status: 200, latencyMs: 71,  provider: 'Helius'     },
  { id: 'r6', ts: '14:20:39', method: 'POST', endpoint: '/defi/swap-quote',       chain: 'Ethereum', status: 200, latencyMs: 154, provider: 'Alchemy'    },
  { id: 'r7', ts: '14:20:31', method: 'GET',  endpoint: '/transaction/lookup',    chain: 'Optimism', status: 429, latencyMs: 22,  provider: 'Moralis'    },
  { id: 'r8', ts: '14:20:24', method: 'POST', endpoint: 'eth_sendRawTransaction', chain: 'Base',     status: 200, latencyMs: 88,  provider: 'QuickNode'  },
  { id: 'r9', ts: '14:20:16', method: 'GET',  endpoint: '/scan/contract',         chain: 'Ethereum', status: 200, latencyMs: 132, provider: 'Chainstack' },
  { id: 'r10',ts: '14:20:08', method: 'GET',  endpoint: '/token/balance',         chain: 'Polygon',  status: 500, latencyMs: 11,  provider: 'Ankr'       },
];

export type ChartPoint = { label: string; requests: number; errors: number };

export const requestSeries: ChartPoint[] = [
  { label: '00:00', requests: 12400, errors: 24  },
  { label: '02:00', requests: 9800,  errors: 18  },
  { label: '04:00', requests: 8600,  errors: 12  },
  { label: '06:00', requests: 11200, errors: 19  },
  { label: '08:00', requests: 18900, errors: 41  },
  { label: '10:00', requests: 26400, errors: 58  },
  { label: '12:00', requests: 31800, errors: 64  },
  { label: '14:00', requests: 36500, errors: 71  },
  { label: '16:00', requests: 34200, errors: 49  },
  { label: '18:00', requests: 29800, errors: 38  },
  { label: '20:00', requests: 22100, errors: 31  },
  { label: '22:00', requests: 16400, errors: 22  },
];

export const topEndpoints = [
  { path: '/token/balance',     calls: 184230, share: 28 },
  { path: 'eth_call',           calls: 121084, share: 18 },
  { path: '/market/price',      calls:  98441, share: 15 },
  { path: '/nft/metadata',      calls:  71212, share: 11 },
  { path: 'eth_getBalance',     calls:  54380, share:  8 },
];

// ============ Overview: 30-day usage (mirrors source buildMockUsage) ============
export type UsageDay = { ts: number; total: number; successful: number; failed: number };
function buildOverviewUsage() {
  const DAY = 86_400_000;
  const start = Date.now() - 29 * DAY;
  const rows: UsageDay[] = [];
  let total = 0;
  for (let i = 0; i < 30; i += 1) {
    const reqs = 28000 + i * 950 + (i % 7) * 2600;
    const successful = Math.round(reqs * 0.994);
    rows.push({ ts: start + i * DAY, total: reqs, successful, failed: reqs - successful });
    total += reqs;
  }
  return { rows, total };
}
export const overviewUsage = buildOverviewUsage();
export const overviewKpis = {
  total: overviewUsage.total,
  successRate: 99.4,
  avgLatency: 38,
};

// ============ Week in review ============
/**
 * The weekly recap deck. Figures are scaled off the last seven rows of
 * `overviewUsage` so the modal and the 30-day chart cannot disagree, and every
 * page carries the arithmetic that produced its headline: a saving nobody can
 * check is a saving nobody believes.
 */
const weekRows = overviewUsage.rows.slice(-7);
const weekTotal = weekRows.reduce((sum, r) => sum + r.total, 0);

export type WeekPageId = 'week' | 'failover' | 'providers' | 'cost' | 'work' | 'recap';

export const weekInReview = {
  label: 'Week 24',
  range: 'Jun 8 – Jun 14',
  requests: weekTotal,
  requestsPrior: Math.round(weekTotal * 0.883),
  series: weekRows.map((r) => r.total),
  chains: 12,
  successRate: 99.6,
  p50: 38,

  failover: {
    triggers: 1284,
    rescued: 1247,
    /** Provider degradations Uniblock routed around before they reached you. */
    incidents: 3,
    worst: { provider: 'Moralis', minutes: 41, chain: 'Solana' },
    /** Days since a request failed for want of a healthy provider. */
    streakDays: 41,
    byProvider: [
      { name: 'Moralis',     count: 612 },
      { name: 'Ankr',        count: 348 },
      { name: 'Infura',      count: 201 },
      { name: 'Blockdaemon', count: 123 },
    ],
  },

  providers: {
    used: 7,
    /** One Uniblock contract stands in for the rest. */
    contractsAvoided: 6,
    names: ['Alchemy', 'QuickNode', 'Infura', 'Moralis', 'Ankr', 'Helius', 'Blockdaemon'],
    split: [
      { name: 'Alchemy',   pct: 38 },
      { name: 'QuickNode', pct: 24 },
      { name: 'Helius',    pct: 16 },
      { name: 'Infura',    pct: 11 },
      { name: 'Others',    pct: 11 },
    ],
  },

  /**
   * Cost.
   *
   * This used to carry `directSpend`, `perMillionDirect` and a `savedWeek`
   * derived from them: what the same week "would have cost" buying seven
   * provider plans directly. Uniblock cannot know that. It would need each
   * vendor's negotiated rate for this customer, at this volume, on this split,
   * and those are private, tiered, and different for every buyer. A precise
   * figure invented from list prices is not a saving, it is a guess wearing a
   * dollar sign, and it sat two pages away from a footnote promising nothing in
   * the deck was estimated.
   *
   * What is left is only what can be shown or counted:
   *   - `spendWeek` / `perMillion`: your invoice, and your spend over your CUs.
   *   - `planFloors`: each provider's *published* entry tier. Public, checkable,
   *     and a floor rather than a projection, so it understates on purpose.
   *     Reaching seven vendors means carrying seven of these before a single
   *     request is served. That is a structural fact about contracts, not a
   *     forecast about prices.
   */
  cost: {
    spendWeek: 2130,
    spendQtd: 27900,
    perMillion: 5.16,
    computeUnits: 413_200_000,
    /**
     * Published entry-tier list price, per provider, per month. `monthly: null`
     * means the vendor does not publish one at all, which is its own argument:
     * that provider costs a sales call before it costs money.
     */
    planFloors: [
      { name: 'Helius',      monthly: 49 },
      { name: 'Alchemy',     monthly: 49 },
      { name: 'QuickNode',   monthly: 49 },
      { name: 'Infura',      monthly: 50 },
      { name: 'Moralis',     monthly: 49 },
      { name: 'Ankr',        monthly: 99 },
      { name: 'Blockdaemon', monthly: null },
    ],
  },

  /**
   * Work you did not do.
   *
   * Formerly "Time", built on `hoursSaved: 31` and a 16/9/6 breakdown. Nobody
   * can count hours an engineer did not spend: it needed a made-up rate per
   * integration and per incident, and the answer moved with the rate. Every row
   * here is either counted from the request log (incidents absorbed, times
   * paged, the streak) or structural (one integration and one invoice instead
   * of seven, because that is how many contracts exist).
   */
  work: {
    integrationsNotWritten: 6,
    invoices: 1,
    keysToRotate: 1,
    /** Aggregate wait removed by routing to the fastest healthy provider. */
    latencySavedMs: 14,
    userHoursSaved: 1.6,
  },
} as const;

// ============ Notifications ============
/**
 * The bell's feed: product news and account events, newest first. `target`
 * makes a row navigable, which is the whole point of an announcement about a
 * chain you can already call.
 */
export type NotificationKind = 'news' | 'status' | 'account';

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  /** Where the row goes when clicked. */
  target?: 'apis-direct' | 'json-rpc' | 'chains' | 'analytics' | 'settings-billing' | 'webhooks';
  cta?: string;
};

export const notifications: Notification[] = [
  {
    id: 'hyperliquid',
    kind: 'news',
    title: 'Hyperliquid is live',
    body: 'Now available on Direct APIs and JSON-RPC. No plan change needed. Call it with the key you already have.',
    ago: '2h ago',
    unread: true,
    target: 'apis-direct',
    cta: 'Open Direct APIs',
  },
  {
    id: 'failover-moralis',
    kind: 'status',
    title: 'Moralis degraded, traffic re-routed',
    body: 'Solana calls failed over to Helius for 41 minutes. 612 requests were rescued; none reached your error handler.',
    ago: 'Yesterday',
    unread: true,
    target: 'analytics',
    cta: 'See routing',
  },
  {
    id: 'webhook-retry',
    kind: 'account',
    title: 'Whale swap alerts paused',
    body: 'Five consecutive delivery failures to hooks.slack.com. The subscription is paused until you resume it.',
    ago: '3d ago',
    unread: false,
    target: 'webhooks',
    cta: 'Review webhook',
  },
  {
    id: 'cu-threshold',
    kind: 'account',
    title: '75% of monthly compute units used',
    body: '6.2M of 40M CUs with 11 days left in the cycle. At the current rate you finish the month at about 9.4M.',
    ago: '5d ago',
    unread: false,
    target: 'settings-billing',
    cta: 'View usage',
  },
  {
    id: 'chains-batch',
    kind: 'news',
    title: '12 chains added this month',
    body: 'Including Katana, Plasma, and Sei v2. Unified endpoints work on all of them from day one.',
    ago: '2w ago',
    unread: false,
    target: 'chains',
    cta: 'Browse chains',
  },
];

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer';
  initials: string;
  lastActive: string;
  status: 'active' | 'invited';
};

export const team: TeamMember[] = [
  { id: 't1', name: 'Robert Truong',   email: 'robert@uniblock.dev',   role: 'Owner',     initials: 'RT', lastActive: '2 min ago',   status: 'active'  },
  { id: 't2', name: 'Mia Chen',        email: 'mia@uniblock.dev',      role: 'Admin',     initials: 'MC', lastActive: '14 min ago',  status: 'active'  },
  { id: 't3', name: 'Jordan Patel',    email: 'jordan@uniblock.dev',   role: 'Developer', initials: 'JP', lastActive: '1 hr ago',    status: 'active'  },
  { id: 't4', name: 'Sasha Romanova',  email: 'sasha@uniblock.dev',    role: 'Developer', initials: 'SR', lastActive: '3 hr ago',    status: 'active'  },
  { id: 't5', name: 'Diego Marín',     email: 'diego@uniblock.dev',    role: 'Viewer',    initials: 'DM', lastActive: 'yesterday',   status: 'active'  },
  { id: 't6', name: 'pending invite',  email: 'avery@bigwallet.xyz',   role: 'Developer', initials: 'AV', lastActive: '–',           status: 'invited' },
];

export type ApiKey = {
  id: string;
  name: string;
  env: 'prod' | 'dev' | 'staging';
  prefix: string;
  scopes: string[];
  created: string;
  lastUsed: string;
  rate: string;
};

export const apiKeys: ApiKey[] = [
  { id: 'k1', name: 'Production, server',    env: 'prod',    prefix: 'ub_live_8f4c2a91',  scopes: ['unified', 'json-rpc', 'webhooks'], created: 'Mar 14, 2025', lastUsed: '2 sec ago',    rate: '500 req/s' },
  { id: 'k2', name: 'Production, read-only', env: 'prod',    prefix: 'ub_live_2e91b047',  scopes: ['unified'],                          created: 'Mar 14, 2025', lastUsed: '6 min ago',    rate: '100 req/s' },
  { id: 'k3', name: 'Staging',                env: 'staging', prefix: 'ub_test_a01f99c4',  scopes: ['unified', 'json-rpc'],              created: 'Apr 02, 2025', lastUsed: '3 hr ago',     rate: '100 req/s' },
  { id: 'k4', name: 'Local dev, Mia',        env: 'dev',     prefix: 'ub_test_71b3ee2d',  scopes: ['unified', 'json-rpc', 'webhooks'], created: 'Apr 22, 2025', lastUsed: 'yesterday',    rate: '50 req/s'  },
];

export type Invoice = {
  id: string;
  date: string;
  period: string;
  amount: string;
  status: 'paid' | 'open' | 'failed';
};

export const invoices: Invoice[] = [
  { id: 'INV-2026-04', date: 'Apr 30, 2026', period: 'April 2026', amount: '$1,284.00', status: 'paid' },
  { id: 'INV-2026-03', date: 'Mar 31, 2026', period: 'March 2026', amount: '$ 1,142.00', status: 'paid' },
  { id: 'INV-2026-02', date: 'Feb 28, 2026', period: 'February 2026', amount: '$  984.00', status: 'paid' },
  { id: 'INV-2026-01', date: 'Jan 31, 2026', period: 'January 2026', amount: '$  827.00', status: 'paid' },
];

export type Plan = {
  id: 'free' | 'startup' | 'growth' | 'enterprise';
  name: string;
  price: string;
  cu: string;
  highlights: string[];
  current?: boolean;
  cta: string;
};

export const plans: Plan[] = [
  { id: 'free',       name: 'Free',       price: '$0',     cu: '40M CUs / mo',  highlights: ['1 project', 'Community support', 'Basic analytics'],                       current: true,  cta: 'Current' },
  { id: 'startup',    name: 'Startup',    price: '$99',    cu: '300M CUs / mo', highlights: ['5 projects', 'Email support', 'Webhook delivery SLAs'],                                  cta: 'Upgrade' },
  { id: 'growth',     name: 'Growth',     price: '$499',   cu: '2B CUs / mo',   highlights: ['Unlimited projects', 'Priority support', 'Custom routing rules', 'SLA 99.95%'],         cta: 'Upgrade' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', cu: 'Custom',        highlights: ['Dedicated nodes', 'SOC 2 / SAML SSO', 'Region pinning', '99.99% SLA, 24/7 support'],    cta: 'Talk to sales' },
];

// ============ Analytics ============
export const computeSeries = requestSeries.map((p) => ({
  label: p.label,
  http: Math.round(p.requests * 2.4),
  wss: Math.round(p.requests * 0.55),
}));

export type LatencyPoint = { label: string; p50: number; p95: number; p99: number };
export const latencySeries: LatencyPoint[] = [
  { label: '00:00', p50: 64, p95: 142, p99: 248 },
  { label: '02:00', p50: 61, p95: 138, p99: 240 },
  { label: '04:00', p50: 58, p95: 130, p99: 226 },
  { label: '06:00', p50: 60, p95: 134, p99: 232 },
  { label: '08:00', p50: 72, p95: 158, p99: 270 },
  { label: '10:00', p50: 81, p95: 176, p99: 298 },
  { label: '12:00', p50: 86, p95: 188, p99: 312 },
  { label: '14:00', p50: 78, p95: 170, p99: 286 },
  { label: '16:00', p50: 74, p95: 162, p99: 274 },
  { label: '18:00', p50: 69, p95: 150, p99: 258 },
  { label: '20:00', p50: 66, p95: 146, p99: 250 },
  { label: '22:00', p50: 63, p95: 140, p99: 244 },
];

export type StatusSlice = { code: string; label: string; pct: number; count: number; tone: 'success' | 'warning' | 'danger' };
export const statusCodes: StatusSlice[] = [
  { code: '2xx', label: 'Success',      pct: 98.2, count: 2367840, tone: 'success' },
  { code: '4xx', label: 'Client error', pct: 1.4,  count: 33746,   tone: 'warning' },
  { code: '5xx', label: 'Server error', pct: 0.4,  count: 9641,    tone: 'danger'  },
];

export const endpointCalls = [
  { name: '/token/balance',     calls: 184230, share: 100 },
  { name: 'eth_call',           calls: 121084, share: 66 },
  { name: '/market/price',      calls: 98441,  share: 53 },
  { name: '/nft/metadata',      calls: 71212,  share: 39 },
  { name: 'eth_getBalance',     calls: 54380,  share: 30 },
  { name: '/defi/swap-quote',   calls: 41203,  share: 22 },
  { name: '/transaction/lookup',calls: 33890,  share: 18 },
];

// Endpoint status / latency widget tiles (Past 1 Hour / 30 Days / 1 Year)
export const statusWindows = [
  { label: 'Past 1 Hour',  total: 41204,    ok: 41181,    failed: 23,    latency: 36 },
  { label: 'Past 30 Days', total: 2410442,  ok: 2367840,  failed: 42602, latency: 38 },
  { label: 'Past 1 Year',  total: 28104993, ok: 27991204, failed: 113789,latency: 41 },
];

// Requests by endpoint over time (stacked)
export const endpointOverTime = requestSeries.map((p) => ({
  label: p.label,
  token: Math.round(p.requests * 0.34),
  rpc: Math.round(p.requests * 0.26),
  market: Math.round(p.requests * 0.18),
  other: Math.round(p.requests * 0.22),
}));

// Request health over time (success vs failed)
export const requestHealth = requestSeries.map((p) => ({
  label: p.label,
  successful: p.requests - p.errors,
  failed: p.errors,
}));

// JSON-RPC analytics
export const rpcMethodCalls = [
  { name: 'eth_call', calls: 121084 },
  { name: 'eth_getBalance', calls: 54380 },
  { name: 'eth_blockNumber', calls: 48210 },
  { name: 'eth_getLogs', calls: 31902 },
  { name: 'eth_getTransactionReceipt', calls: 22418 },
  { name: 'eth_sendRawTransaction', calls: 12044 },
];
export const rpcChainCalls = [
  { name: 'Ethereum', calls: 142300, color: '#627eea' },
  { name: 'Base', calls: 68420, color: '#0052ff' },
  { name: 'Polygon', calls: 41280, color: '#8247e5' },
  { name: 'Arbitrum', calls: 29840, color: '#28a0f0' },
  { name: 'Optimism', calls: 18220, color: '#ff0420' },
];
export const rpcBatch = [
  { label: 'Batched', value: 38, color: 'var(--ub-blue)' },
  { label: 'Single', value: 62, color: 'var(--ub-border)' },
];

// Compute units
export const cuUsed = 6184920;
export const cuLimit = 40000000;
export const cuBreakdown = [
  { name: 'Unified API', cu: 3420000, share: 100 },
  { name: 'JSON-RPC', cu: 1980000, share: 58 },
  { name: 'WebSocket', cu: 540000, share: 16 },
  { name: 'Webhooks', cu: 244920, share: 7 },
];

// ============ Direct APIs ============
// ============ JSON-RPC ============
export const jsonRpcHttp = 'https://api.uniblock.dev/uni/v1/json-rpc';
export const jsonRpcWss = 'wss://api.uniblock.dev/uni/v1/json-rpc';

export type RpcMethod = { name: string; group: string; description: string };
export const rpcMethods: RpcMethod[] = [
  { name: 'eth_blockNumber',          group: 'Blocks',       description: 'Latest block number' },
  { name: 'eth_getBlockByNumber',     group: 'Blocks',       description: 'Block by number, with transactions' },
  { name: 'eth_getBlockByHash',       group: 'Blocks',       description: 'Block by hash' },
  { name: 'eth_call',                 group: 'State',        description: 'Read-only contract call' },
  { name: 'eth_getBalance',           group: 'State',        description: 'Native balance of an account' },
  { name: 'eth_getCode',              group: 'State',        description: 'Contract bytecode at address' },
  { name: 'eth_getStorageAt',         group: 'State',        description: 'Storage slot value' },
  { name: 'eth_getTransactionByHash', group: 'Transactions', description: 'Transaction by hash' },
  { name: 'eth_getTransactionReceipt',group: 'Transactions', description: 'Receipt with logs and status' },
  { name: 'eth_sendRawTransaction',   group: 'Transactions', description: 'Broadcast a signed transaction' },
  { name: 'eth_getTransactionCount',  group: 'Transactions', description: 'Account nonce' },
  { name: 'eth_getLogs',              group: 'Logs',         description: 'Event logs matching a filter' },
  { name: 'eth_gasPrice',             group: 'Gas',          description: 'Current gas price' },
  { name: 'eth_estimateGas',          group: 'Gas',          description: 'Estimate gas for a call' },
  { name: 'eth_feeHistory',           group: 'Gas',          description: 'Historical base fee & priority fee' },
];

export type RpcProvider = { name: string; icon: string };
const rp = (name: string, file: string): RpcProvider => ({ name, icon: `/assets/icons/providers/${file}` });

// JSON-RPC / WebSocket routing providers available per chain (listJsonRpcProvidersForChain)
const PROV = {
  alchemy: rp('Alchemy', 'Alchemy.webp'),
  quicknode: rp('QuickNode', 'QuickNode.webp'),
  infura: rp('Infura', 'Infura.webp'),
  chainstack: rp('Chainstack', 'Chainstack.webp'),
  ankr: rp('Ankr', 'Ankr.webp'),
  blockdaemon: rp('Blockdaemon', 'Blockdaemon.webp'),
  getblock: rp('GetBlock', 'GetBlock.webp'),
  tatum: rp('Tatum', 'Tatum.webp'),
  nodies: rp('Nodies', 'Nodies.webp'),
  pokt: rp('Pokt', 'Pokt.webp'),
};

// A chain "group" bundles a mainnet with its related networks (devnets/testnets).
export type RpcNetwork = {
  name: string;
  chainId: string;
  status: 'online' | 'offline';
  kind: 'mainnet' | 'testnet';
  lastRequest: string;
  wssProviders: RpcProvider[];
};
export type RpcGroup = { id: string; name: string; icon: string; networks: RpcNetwork[] };

const NA = 'No activity in last 7 days';
const evmProviders = [PROV.alchemy, PROV.quicknode, PROV.infura, PROV.chainstack, PROV.ankr, PROV.blockdaemon];
const solProviders = [PROV.quicknode, PROV.chainstack];
const otherProviders = [PROV.quicknode, PROV.ankr];

/**
 * Networks the JSON-RPC reference actually publishes: 83 chains, each with a
 * mainnet and a testnet. The marketing figure is "300+ blockchains" and it lives
 * in `platformStats`; this is the count of what you can look up, which is the
 * only number a network list should be footed with.
 */
export const rpcNetworkCount = docNetworkCount;

/**
 * One group per documented chain, with its real networks and chain IDs.
 *
 * The WebSocket provider sets are the one part not published per chain; the
 * docs list providers platform-wide, not per network, so they stay the app's
 * existing approximation: the EVM roster for EVM chains, the Solana pair for
 * Solana, and the multi-chain subset elsewhere.
 */
export const rpcGroups: RpcGroup[] = docChains.map((chain) => {
  const wssProviders =
    chain.category === 'solana' ? solProviders : chain.evm ? evmProviders : otherProviders;
  const networks: RpcNetwork[] = [
    {
      name: chain.name,
      chainId: String(chain.chainId),
      status: 'online',
      kind: 'mainnet',
      lastRequest: NA,
      wssProviders,
    },
  ];
  if (chain.testnet) {
    networks.push({
      name: chain.testnet.name,
      chainId: chain.testnet.chainId,
      status: 'online',
      kind: 'testnet',
      lastRequest: NA,
      wssProviders,
    });
  }
  return { id: chain.id, name: chain.name, icon: chain.icon, networks };
});

// ============ Webhooks ============
export type Webhook = {
  id: string;
  event: string;
  label: string;
  provider: string;
  url: string;
  chain: string;
  status: 'active' | 'paused';
  deliveries: number;
  successRate: number;
  created: string;
  ago: string;
};

export const webhooks: Webhook[] = [
  { id: 'wh1', event: 'Address Activity', label: 'Treasury wallet activity', provider: 'Alchemy',  url: 'https://api.acme.xyz/hooks/treasury',   chain: 'Ethereum', status: 'active', deliveries: 18420, successRate: 99.98, created: 'Apr 12, 2026', ago: '2 months ago' },
  { id: 'wh2', event: 'NFT Mint',         label: 'Collection mint feed',     provider: 'QuickNode', url: 'https://api.acme.xyz/hooks/mints',     chain: 'Base',     status: 'active', deliveries: 6240,  successRate: 99.91, created: 'Apr 28, 2026', ago: '6 weeks ago' },
  { id: 'wh3', event: 'DEX Swap',         label: 'Whale swap alerts',        provider: 'Moralis',  url: 'https://hooks.slack.com/services/T0…', chain: 'Solana',   status: 'paused', deliveries: 1180,  successRate: 98.40, created: 'May 03, 2026', ago: '5 weeks ago' },
];

export type WebhookEventType = { id: string; label: string; description: string };
export const webhookEventTypes: WebhookEventType[] = [
  { id: 'address.activity', label: 'Address Activity', description: 'Native + token transfers in or out of an address' },
  { id: 'nft.mint',         label: 'NFT Mints',        description: 'New mints for a collection or wallet' },
  { id: 'dex.swap',         label: 'DEX Swaps',        description: 'Swaps on supported DEXes above a threshold' },
  { id: 'contract.event',   label: 'Contract Events',  description: 'Any decoded log from a contract you specify' },
];
