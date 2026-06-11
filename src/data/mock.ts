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
};

export const providers: Provider[] = [
  { id: 'alchemy', name: 'Alchemy', description: 'Enhanced APIs and elastic node infra', status: 'operational', uptime: 99.99, latencyMs: 78 },
  { id: 'infura', name: 'Infura', description: 'Reliable JSON-RPC across major chains', status: 'operational', uptime: 99.97, latencyMs: 92 },
  { id: 'quicknode', name: 'QuickNode', description: 'Global edge nodes with addons', status: 'operational', uptime: 99.96, latencyMs: 71 },
  { id: 'moralis', name: 'Moralis', description: 'Web3 data and authentication APIs', status: 'degraded', uptime: 99.7, latencyMs: 138 },
  { id: 'chainstack', name: 'Chainstack', description: 'Dedicated and shared nodes', status: 'operational', uptime: 99.95, latencyMs: 102 },
  { id: 'ankr', name: 'Ankr', description: 'Decentralized RPC infrastructure', status: 'operational', uptime: 99.92, latencyMs: 121 },
  { id: 'helius', name: 'Helius', description: 'Solana-focused RPC and APIs', status: 'operational', uptime: 99.98, latencyMs: 64 },
  { id: 'tatum', name: 'Tatum', description: 'Multi-chain SDK and node service', status: 'operational', uptime: 99.9, latencyMs: 145 },
];

export type Chain = {
  id: string;
  name: string;
  symbol: string;
  chainId: string | number;
  icon: string;
  category: 'evm' | 'solana' | 'bitcoin' | 'cosmos' | 'l2' | 'other';
  color: string;
};

const chainIcon = (file: string | number) => `/assets/icons/chain/${file}.webp`;

// Real chains + real chainIds + real icon assets (popularity-ordered, per source)
export const chains: Chain[] = [
  { id: 'solana',    name: 'Solana',     symbol: 'SOL',  chainId: 'solana', icon: chainIcon('solana'), category: 'solana', color: '#9945ff' },
  { id: 'ethereum',  name: 'Ethereum',   symbol: 'ETH',  chainId: 1,     icon: chainIcon(1),     category: 'evm', color: '#627eea' },
  { id: 'bnb',       name: 'BNB Chain',  symbol: 'BNB',  chainId: 56,    icon: chainIcon(56),    category: 'evm', color: '#f0b90b' },
  { id: 'base',      name: 'Base',       symbol: 'BASE', chainId: 8453,  icon: chainIcon(8453),  category: 'l2',  color: '#0052ff' },
  { id: 'polygon',   name: 'Polygon',    symbol: 'POL',  chainId: 137,   icon: chainIcon(80002), category: 'evm', color: '#8247e5' },
  { id: 'arbitrum',  name: 'Arbitrum',   symbol: 'ARB',  chainId: 42161, icon: chainIcon(42161), category: 'l2',  color: '#28a0f0' },
  { id: 'optimism',  name: 'Optimism',   symbol: 'OP',   chainId: 10,    icon: chainIcon(10),    category: 'l2',  color: '#ff0420' },
  { id: 'avalanche', name: 'Avalanche',  symbol: 'AVAX', chainId: 43114, icon: chainIcon(43114), category: 'evm', color: '#e84142' },
  { id: 'fantom',    name: 'Fantom',     symbol: 'FTM',  chainId: 250,   icon: chainIcon(250),   category: 'evm', color: '#1969ff' },
  { id: 'zksync',    name: 'zkSync Era', symbol: 'ZK',   chainId: 324,   icon: chainIcon(324),   category: 'l2',  color: '#8c8dfc' },
  { id: 'linea',     name: 'Linea',      symbol: 'LINEA',chainId: 59144, icon: chainIcon(59144), category: 'l2',  color: '#61dfff' },
  { id: 'blast',     name: 'Blast',      symbol: 'BLAST',chainId: 81457, icon: chainIcon(81457), category: 'l2',  color: '#fcfc03' },
  { id: 'mantle',    name: 'Mantle',     symbol: 'MNT',  chainId: 5000,  icon: chainIcon(5000),  category: 'l2',  color: '#000000' },
  { id: 'gnosis',    name: 'Gnosis',     symbol: 'GNO',  chainId: 100,   icon: chainIcon(100),   category: 'evm', color: '#3e6957' },
  { id: 'sui',       name: 'Sui',        symbol: 'SUI',  chainId: 'sui', icon: chainIcon('sui'), category: 'other', color: '#4ca3ff' },
];

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
  { id: 't6', name: 'pending invite',  email: 'avery@bigwallet.xyz',   role: 'Developer', initials: 'AV', lastActive: '—',           status: 'invited' },
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
  { id: 'k1', name: 'Production — server',    env: 'prod',    prefix: 'ub_live_8f4c2a91',  scopes: ['unified', 'json-rpc', 'webhooks'], created: 'Mar 14, 2025', lastUsed: '2 sec ago',    rate: '500 req/s' },
  { id: 'k2', name: 'Production — read-only', env: 'prod',    prefix: 'ub_live_2e91b047',  scopes: ['unified'],                          created: 'Mar 14, 2025', lastUsed: '6 min ago',    rate: '100 req/s' },
  { id: 'k3', name: 'Staging',                env: 'staging', prefix: 'ub_test_a01f99c4',  scopes: ['unified', 'json-rpc'],              created: 'Apr 02, 2025', lastUsed: '3 hr ago',     rate: '100 req/s' },
  { id: 'k4', name: 'Local dev — Mia',        env: 'dev',     prefix: 'ub_test_71b3ee2d',  scopes: ['unified', 'json-rpc', 'webhooks'], created: 'Apr 22, 2025', lastUsed: 'yesterday',    rate: '50 req/s'  },
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
export type DirectProvider = {
  name: string;
  subtitle: string;
  icon: string;
  endpoints: number;
  chains: number;
  featured?: boolean;
};

const provIcon = (file: string) => `/assets/icons/providers/${file}`;

export const directProviders: DirectProvider[] = [
  { name: 'Alchemy',    subtitle: 'Ethereum & L2 infra suite',  icon: provIcon('Alchemy.webp'),    endpoints: 64, chains: 18, featured: true },
  { name: 'Helius',     subtitle: 'Best for Solana coverage',   icon: provIcon('Helius.webp'),     endpoints: 41, chains: 2,  featured: true },
  { name: 'QuickNode',  subtitle: 'High-performance RPC',       icon: provIcon('QuickNode.webp'),  endpoints: 58, chains: 24, featured: true },
  { name: 'Moralis',    subtitle: 'Web3 data & auth APIs',      icon: provIcon('Moralis.webp'),    endpoints: 47, chains: 16, featured: true },
  { name: 'Infura',     subtitle: 'Ethereum & IPFS access',     icon: provIcon('Infura.webp'),     endpoints: 32, chains: 12 },
  { name: 'Chainstack', subtitle: 'Enterprise node APIs',       icon: provIcon('Chainstack.webp'), endpoints: 28, chains: 20 },
  { name: 'Ankr',       subtitle: 'Affordable multi-chain RPC', icon: provIcon('Ankr.webp'),       endpoints: 24, chains: 30 },
  { name: 'GoldRush',   subtitle: 'Cross-chain on-chain data',  icon: provIcon('GoldRush.svg'),    endpoints: 38, chains: 22 },
  { name: 'CoinGecko',  subtitle: 'Token prices & metadata',    icon: provIcon('CoinGecko.webp'),  endpoints: 19, chains: 1  },
  { name: 'EtherScan',  subtitle: 'Ethereum explorer data',     icon: provIcon('EtherScan.webp'),  endpoints: 21, chains: 1  },
  { name: 'SimpleHash', subtitle: 'NFT & token data APIs',      icon: provIcon('SimpleHash.webp'), endpoints: 26, chains: 14 },
  { name: 'Coinbase',   subtitle: 'Exchange & wallet data',     icon: provIcon('Coinbase.webp'),   endpoints: 17, chains: 11 },
  { name: 'DefiLlama',  subtitle: 'DeFi TVL & protocols',       icon: provIcon('DefiLlama.webp'),  endpoints: 15, chains: 40 },
  { name: 'Birdeye',    subtitle: 'Solana DEX & token data',    icon: provIcon('Birdeye.webp'),    endpoints: 22, chains: 3  },
  { name: 'Tatum',      subtitle: 'Multi-chain unified API',    icon: provIcon('Tatum.webp'),      endpoints: 30, chains: 25 },
  { name: 'Blockdaemon',subtitle: 'Institutional nodes & APIs', icon: provIcon('Blockdaemon.webp'),endpoints: 27, chains: 28 },
];

export const directSpotlight = {
  title: 'xStocks',
  category: 'Tokenized equities · Kraken',
  description:
    'Tokenized US equities on Kraken, with real-time prices and corporate actions for 200+ stocks on-chain.',
  endpoints: 12,
};

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

export type RpcChain = { name: string; symbol: string; chainId: number; providers: number; color: string; icon: string };
export const rpcChains: RpcChain[] = [
  { name: 'Ethereum',  symbol: 'ETH',  chainId: 1,     providers: 6, color: '#627eea', icon: chainIcon(1) },
  { name: 'BNB Chain', symbol: 'BNB',  chainId: 56,    providers: 4, color: '#f0b90b', icon: chainIcon(56) },
  { name: 'Base',      symbol: 'BASE', chainId: 8453,  providers: 5, color: '#0052ff', icon: chainIcon(8453) },
  { name: 'Polygon',   symbol: 'POL',  chainId: 137,   providers: 5, color: '#8247e5', icon: chainIcon(80002) },
  { name: 'Arbitrum',  symbol: 'ARB',  chainId: 42161, providers: 5, color: '#28a0f0', icon: chainIcon(42161) },
  { name: 'Optimism',  symbol: 'OP',   chainId: 10,    providers: 4, color: '#ff0420', icon: chainIcon(10) },
  { name: 'Avalanche', symbol: 'AVAX', chainId: 43114, providers: 4, color: '#e84142', icon: chainIcon(43114) },
  { name: 'Linea',     symbol: 'LINEA',chainId: 59144, providers: 3, color: '#61dfff', icon: chainIcon(59144) },
];

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
