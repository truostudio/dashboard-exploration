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
  category: 'evm' | 'solana' | 'bitcoin' | 'cosmos' | 'l2' | 'other';
  color: string;
};

export const chains: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', category: 'evm', color: '#627eea' },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', category: 'evm', color: '#8247e5' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', category: 'l2', color: '#28a0f0' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP', category: 'l2', color: '#ff0420' },
  { id: 'base', name: 'Base', symbol: 'BASE', category: 'l2', color: '#0052ff' },
  { id: 'bnb', name: 'BNB Chain', symbol: 'BNB', category: 'evm', color: '#f0b90b' },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', category: 'evm', color: '#e84142' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', category: 'solana', color: '#9945ff' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', category: 'bitcoin', color: '#f7931a' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', category: 'cosmos', color: '#2e3148' },
  { id: 'sui', name: 'Sui', symbol: 'SUI', category: 'other', color: '#4ca3ff' },
  { id: 'aptos', name: 'Aptos', symbol: 'APT', category: 'other', color: '#1ea7a4' },
  { id: 'starknet', name: 'Starknet', symbol: 'STRK', category: 'l2', color: '#ec796b' },
  { id: 'scroll', name: 'Scroll', symbol: 'SCRL', category: 'l2', color: '#fbb471' },
  { id: 'zksync', name: 'zkSync Era', symbol: 'ZK', category: 'l2', color: '#8c8dfc' },
  { id: 'linea', name: 'Linea', symbol: 'LINEA', category: 'l2', color: '#61dfff' },
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
