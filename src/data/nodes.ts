/**
 * Dedicated nodes.
 *
 * A dedicated node is a chain client running on hardware reserved for one
 * customer: Erigon or Reth for an EVM chain, Agave for Solana, each paired with
 * whatever else that chain needs to stay at the head (a consensus client on
 * Ethereum, `op-node` on an OP Stack rollup). Uniblock still fronts it, so a
 * request goes to your node first and only falls back to the shared fleet when
 * yours cannot serve it.
 *
 * That shape decides what this screen has to answer, and it is not "is it up".
 * Someone who has paid for a node wants to know:
 *
 *   1. Is it at the head?  Block or slot lag is the only honest health metric.
 *      A node three minutes behind answers every request, all of them wrong.
 *   2. What is it costing me in headroom?  Sustained RPS against provisioned
 *      capacity, because the ceiling is what you actually bought.
 *   3. What is it serving?  Method mix, because archive-only calls
 *      (`debug_traceTransaction`, `trace_block`, wide `eth_getLogs` ranges) are
 *      the reason a dedicated node exists at all, and cheap calls that could
 *      have gone to the shared pool are money left on the floor.
 *   4. Is the disk going to run out?  Archive state only grows, and disk is
 *      what kills node operators, not CPU.
 *   5. When did it fail, and did anyone notice?  Failover to the shared fleet
 *      is the thing the routing layer is for; it should be logged, not hidden.
 *
 * Prototype data. Deterministic, hand-written rather than generated, because
 * these are five nodes on a screen and the specifics are the point: real client
 * versions, real method names, plausible sync state for each chain's block time.
 * Figures are internally consistent with the app's stated present (Aug 2026).
 */

export type NodeStatus = 'healthy' | 'syncing' | 'degraded';

/** Archive keeps every historical state; full prunes it and cannot serve traces. */
export type NodeKind = 'archive' | 'full';

export type NodeEvent = {
  id: string;
  ts: string;
  kind: 'failover' | 'upgrade' | 'reorg' | 'restart' | 'scale';
  title: string;
  detail: string;
};

export type DedicatedNode = {
  id: string;
  /** Chain id, keys the artwork and colour in `data/analytics`. */
  chain: string;
  chainName: string;
  kind: NodeKind;
  status: NodeStatus;
  /** Execution client and version, as the node reports it in `web3_clientVersion`. */
  client: string;
  /** The second process the chain needs to follow the head, where there is one. */
  pairedWith?: string;
  region: string;
  /** Blocks on an EVM chain, slots on Solana. */
  unit: 'block' | 'slot';
  height: number;
  /** How far behind the network head, in the unit above. */
  lag: number;
  /** Seconds of chain time that lag represents. The number people actually feel. */
  lagSeconds: number;
  peers: number;
  p50: number;
  p95: number;
  p99: number;
  /** What the same calls cost on the shared fleet, for the comparison that sells it. */
  sharedP95: number;
  /** Sustained requests per second over the last hour. */
  rps: number;
  /** Provisioned ceiling. */
  capacity: number;
  /** Percent over the trailing 30 days. */
  uptime: number;
  errorRate: number;
  disk: { usedTb: number; totalTb: number; growthGbDay: number };
  /** 24 hourly p95 readings, for the row sparkline. */
  latency: number[];
  https: string;
  wss: string;
  provisioned: string;
  monthly: number;
  /** Top methods by call share over 24h. Shares are of this node's traffic. */
  methods: { name: string; share: number; calls: string; note?: string }[];
  events: NodeEvent[];
};

export const dedicatedNodes: DedicatedNode[] = [
  {
    id: 'eth-archive-use1',
    chain: 'ethereum',
    chainName: 'Ethereum',
    kind: 'archive',
    status: 'healthy',
    client: 'Erigon 3.2.1',
    pairedWith: 'Lighthouse 6.1.0',
    region: 'us-east-1',
    unit: 'block',
    height: 25764318,
    lag: 0,
    lagSeconds: 0,
    peers: 87,
    p50: 19,
    p95: 41,
    p99: 128,
    sharedP95: 74,
    rps: 342,
    capacity: 900,
    uptime: 99.99,
    errorRate: 0.02,
    disk: { usedTb: 2.34, totalTb: 4, growthGbDay: 7.4 },
    latency: [44, 42, 39, 38, 41, 45, 52, 61, 58, 49, 44, 41, 40, 39, 42, 47, 55, 63, 57, 48, 43, 41, 40, 41],
    https: 'https://eth-archive-use1.nodes.uniblock.dev',
    wss: 'wss://eth-archive-use1.nodes.uniblock.dev',
    provisioned: '14 Feb 2026',
    monthly: 3200,
    methods: [
      { name: 'debug_traceTransaction', share: 31, calls: '4.10M', note: 'archive only' },
      { name: 'eth_getLogs', share: 24, calls: '3.17M', note: 'avg range 4,800 blocks' },
      { name: 'trace_block', share: 14, calls: '1.85M', note: 'archive only' },
      { name: 'eth_call', share: 12, calls: '1.59M' },
      { name: 'eth_getBalance', share: 9, calls: '1.19M', note: '62% at a historical block' },
      { name: 'eth_getBlockByNumber', share: 6, calls: '793K' },
      { name: 'eth_sendRawTransaction', share: 4, calls: '529K' },
    ],
    events: [
      {
        id: 'e1',
        ts: '11 Aug, 04:12',
        kind: 'upgrade',
        title: 'Erigon 3.2.0 → 3.2.1',
        detail: 'Rolled during your low window. Traffic held on the shared fleet for 6m 40s; no requests dropped.',
      },
      {
        id: 'e2',
        ts: '04 Aug, 17:38',
        kind: 'reorg',
        title: '2-block reorg at 25,713,904',
        detail: 'Followed the canonical head in 11s. Two receipts served from the orphaned branch in that window.',
      },
      {
        id: 'e3',
        ts: '22 Jul, 09:05',
        kind: 'scale',
        title: 'Disk 3 TB → 4 TB',
        detail: 'Archive state was 78% full and growing 7.4 GB/day. Next headroom review around Mar 2027.',
      },
    ],
  },
  {
    id: 'base-full-use1',
    chain: 'base',
    chainName: 'Base',
    kind: 'full',
    status: 'healthy',
    client: 'op-reth 1.4.2',
    pairedWith: 'op-node 1.11.0',
    region: 'us-east-1',
    unit: 'block',
    height: 50142779,
    lag: 1,
    lagSeconds: 2,
    peers: 62,
    p50: 14,
    p95: 29,
    p99: 86,
    sharedP95: 58,
    rps: 611,
    capacity: 750,
    uptime: 99.97,
    errorRate: 0.04,
    disk: { usedTb: 3.12, totalTb: 6, growthGbDay: 19.2 },
    latency: [31, 29, 28, 27, 29, 33, 41, 52, 58, 47, 36, 31, 29, 28, 30, 38, 49, 61, 54, 42, 34, 30, 29, 29],
    https: 'https://base-full-use1.nodes.uniblock.dev',
    wss: 'wss://base-full-use1.nodes.uniblock.dev',
    provisioned: '02 Mar 2026',
    monthly: 1800,
    methods: [
      { name: 'eth_call', share: 38, calls: '11.4M' },
      { name: 'eth_getLogs', share: 21, calls: '6.31M', note: 'avg range 900 blocks' },
      { name: 'eth_getTransactionReceipt', share: 15, calls: '4.51M' },
      { name: 'eth_blockNumber', share: 11, calls: '3.30M', note: 'could serve from cache' },
      { name: 'eth_getBlockByNumber', share: 8, calls: '2.40M' },
      { name: 'eth_sendRawTransaction', share: 7, calls: '2.10M' },
    ],
    events: [
      {
        id: 'e1',
        ts: '12 Aug, 21:47',
        kind: 'failover',
        title: 'Shed 4.2% of traffic to the shared fleet',
        detail: 'Sustained load hit 94% of the 750 rps ceiling for 9 minutes. The overflow was served at 71ms p95 instead of 29ms.',
      },
      {
        id: 'e2',
        ts: '09 Aug, 02:20',
        kind: 'upgrade',
        title: 'op-reth 1.4.1 → 1.4.2',
        detail: 'Required by the Base client release. 4m 02s on the shared fleet.',
      },
      {
        id: 'e3',
        ts: '28 Jul, 13:11',
        kind: 'restart',
        title: 'Client restart after an OOM',
        detail: 'A 2.1M-block eth_getLogs range from your indexer. Back at the head in 3m 18s; that range is now rejected at the edge.',
      },
    ],
  },
  {
    id: 'sol-rpc-euw1',
    chain: 'solana',
    chainName: 'Solana',
    kind: 'full',
    status: 'syncing',
    client: 'Agave 2.3.4',
    region: 'eu-west-1',
    unit: 'slot',
    height: 428937602,
    lag: 2516,
    lagSeconds: 1006,
    peers: 41,
    p50: 26,
    p95: 63,
    p99: 210,
    sharedP95: 81,
    rps: 0,
    capacity: 600,
    uptime: 99.42,
    errorRate: 0,
    disk: { usedTb: 1.08, totalTb: 2, growthGbDay: 31.5 },
    latency: [58, 57, 60, 62, 59, 61, 64, 71, 68, 63, 60, 59, 61, 66, 74, 88, 96, 0, 0, 0, 0, 0, 0, 0],
    https: 'https://sol-rpc-euw1.nodes.uniblock.dev',
    wss: 'wss://sol-rpc-euw1.nodes.uniblock.dev',
    provisioned: '19 Jun 2026',
    monthly: 2400,
    methods: [
      { name: 'getProgramAccounts', share: 34, calls: '1.92M', note: 'needs the account index' },
      { name: 'getSignaturesForAddress', share: 22, calls: '1.24M' },
      { name: 'getTransaction', share: 18, calls: '1.02M' },
      { name: 'getAccountInfo', share: 15, calls: '847K' },
      { name: 'sendTransaction', share: 11, calls: '621K' },
    ],
    events: [
      {
        id: 'e1',
        ts: '13 Aug, 06:02',
        kind: 'restart',
        title: 'Restoring from snapshot',
        detail: 'The accounts index fell behind after a validator restart. Catching up at roughly 2,900 slots/min; back at the head in about 14 minutes.',
      },
      {
        id: 'e2',
        ts: '13 Aug, 05:44',
        kind: 'failover',
        title: 'All Solana traffic on the shared fleet',
        detail: 'Automatic, at the moment slot lag passed 150. Your callers saw 81ms p95 instead of 63ms. Nothing errored.',
      },
      {
        id: 'e3',
        ts: '31 Jul, 15:30',
        kind: 'upgrade',
        title: 'Agave 2.3.2 → 2.3.4',
        detail: 'Mandatory cluster release. 11m 26s on the shared fleet, which is what a Solana restart costs.',
      },
    ],
  },
];

/** What the sizing conversation covers. Used by the empty state. */
export const SIZING_QUESTIONS: { label: string; value: string }[] = [
  { label: 'Chains', value: 'Which networks need dedicated capacity' },
  { label: 'Throughput', value: 'Sustained and peak requests per second' },
  { label: 'Methods', value: 'Anything heavy: archive reads, traces, wide log ranges' },
  { label: 'History', value: 'How far back you query, which decides archive or full' },
  { label: 'Regions', value: 'Where your callers are' },
  { label: 'Latency target', value: 'The p95 you are holding yourself to' },
];

export const fleet = {
  get count() {
    return dedicatedNodes.length;
  },
  /** Weighted by traffic, not a mean of means: a quiet node cannot flatter the number. */
  get p95() {
    const live = dedicatedNodes.filter((n) => n.rps > 0);
    const load = live.reduce((sum, n) => sum + n.rps, 0) || 1;
    return Math.round(live.reduce((sum, n) => sum + n.p95 * n.rps, 0) / load);
  },
  get sharedP95() {
    const live = dedicatedNodes.filter((n) => n.rps > 0);
    const load = live.reduce((sum, n) => sum + n.rps, 0) || 1;
    return Math.round(live.reduce((sum, n) => sum + n.sharedP95 * n.rps, 0) / load);
  },
  get rps() {
    return dedicatedNodes.reduce((sum, n) => sum + n.rps, 0);
  },
  get capacity() {
    return dedicatedNodes.reduce((sum, n) => sum + n.capacity, 0);
  },
  get uptime() {
    return Math.min(...dedicatedNodes.map((n) => n.uptime));
  },
  get monthly() {
    return dedicatedNodes.reduce((sum, n) => sum + n.monthly, 0);
  },
  /** Nodes not currently serving their own traffic. */
  get offHead() {
    return dedicatedNodes.filter((n) => n.status !== 'healthy').length;
  },
};
