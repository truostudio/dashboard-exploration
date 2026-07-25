/**
 * API catalog sourced from https://docs.uniblock.dev (llms.txt + the per-provider
 * .md reference pages), fetched 2026-07-24.
 *
 * `endpointCount` and `categories` on every provider are the real figures from
 * the Direct API providers overview. Full endpoint lists are transcribed for the
 * featured providers; the rest carry their real category breakdown and link out
 * to the reference page they came from.
 */

export type Method = 'GET' | 'POST' | 'WS';

export type ApiEndpoint = {
  method: Method;
  /** Request path as published in the reference. */
  path: string;
  /** Human-readable title from the reference page. */
  title: string;
  category: string;
};

/* ============================================================
   Unified APIs: one normalized surface across every chain
   ============================================================ */

export type UnifiedCategory = {
  id: string;
  label: string;
  description: string;
  endpoints: ApiEndpoint[];
};

const u = (method: Method, path: string, title: string, category: string): ApiEndpoint => ({
  method,
  path,
  title,
  category,
});

export const unifiedCategories: UnifiedCategory[] = [
  {
    id: 'token',
    label: 'Token',
    description: 'Balances, metadata, transfers, allowances, and pricing for any token.',
    endpoints: [
      u('GET', '/token/metadata', 'Get Token Metadata', 'Token'),
      u('GET', '/token/balance', 'Get Address Token Balances', 'Token'),
      u('GET', '/token/balance/historical', 'Get Address Token Balance History', 'Token'),
      u('GET', '/token/price', 'Get Token USD Price', 'Token'),
      u('GET', '/token/price/historical', 'Get Token USD Price History', 'Token'),
      u('GET', '/token/transfers', 'Get Address Token Transfers', 'Token'),
      u('GET', '/token/allowances', 'Get Address Allowances', 'Token'),
      u('GET', '/token/activity', 'Get Wallet Last Active', 'Token'),
      u('GET', '/token/portfolio', 'Get Address Portfolio', 'Token'),
    ],
  },
  {
    id: 'market',
    label: 'Market Data',
    description: 'Prices, market caps, volume, and trend data aggregated across sources.',
    endpoints: [
      u('GET', '/market-data/price', 'Get Token Price', 'Market Data'),
      u('GET', '/market-data/market-cap', 'Get Token Market Cap', 'Market Data'),
      u('GET', '/market-data/24-hour-volume', 'Get Token 24 Hour Volume', 'Market Data'),
      u('GET', '/market-data/history', 'Get Token History Snapshot', 'Market Data'),
      u('GET', '/market-data/chart-range', 'Get Token Market Chart', 'Market Data'),
      u('GET', '/market-data/chart-price-range', 'Get Token Price Range', 'Market Data'),
      u('GET', '/market-data/trending', 'Get Trending Tokens', 'Market Data'),
    ],
  },
  {
    id: 'nft',
    label: 'NFT',
    description: 'Collections, metadata, traits, rarity, sales, owners, and floor prices.',
    endpoints: [
      u('GET', '/nft/balance', 'Get Wallet NFT Balances', 'NFT'),
      u('GET', '/nft/balance/advanced', 'Get Wallet NFT Balances (Advanced)', 'NFT'),
      u('GET', '/nft/metadata', 'Get NFT Metadata', 'NFT'),
      u('GET', '/nft/collection-metadata', 'Get NFT Collection Metadata', 'NFT'),
      u('GET', '/nft/nft-in-collection', 'Get Collection NFTs', 'NFT'),
      u('GET', '/nft/collection/traits', 'Get Collection Traits', 'NFT'),
      u('GET', '/nft/collection/trait/attributes', 'Get Collection Trait Attributes', 'NFT'),
      u('GET', '/nft/collection/rarity', 'Get Collection Rarity Summary', 'NFT'),
      u('GET', '/nft/floor-price', 'Get Collection Floor Prices', 'NFT'),
      u('GET', '/nft/sales', 'Get NFT Sales', 'NFT'),
      u('GET', '/nft/top-sales', 'Get Top NFT Sales', 'NFT'),
      u('GET', '/nft/transfers', 'Get NFT Transfers', 'NFT'),
      u('GET', '/nft/owners/nft', 'Get NFT Owners', 'NFT'),
      u('GET', '/nft/owners/contract', 'Get Contract NFT Owners', 'NFT'),
      u('GET', '/nft/owned-collections', 'Get Wallet NFT Collections', 'NFT'),
      u('GET', '/nft/is-nft-holder', 'Get Wallet NFT Holder Status', 'NFT'),
      u('GET', '/nft/is-airdrop', 'Get Token Airdrop Flag', 'NFT'),
      u('GET', '/nft/listings', 'Get NFT Listings', 'NFT'),
    ],
  },
  {
    id: 'transaction',
    label: 'Transaction',
    description: 'Transaction lookups by hash, address, and block.',
    endpoints: [
      u('GET', '/transaction', 'Get Transaction by Hash', 'Transaction'),
      u('GET', '/transactions', 'Get Address Transactions', 'Transaction'),
      u('GET', '/transactions/block', 'Get Block Transactions', 'Transaction'),
      u('GET', '/transactions/advanced', 'Get Transactions (Advanced)', 'Transaction'),
    ],
  },
  {
    id: 'scan',
    label: 'Scan',
    description: 'Explorer-grade data: balances, logs, contracts, gas, and supply.',
    endpoints: [
      u('GET', '/scan/address-transactions', 'Get Address Transactions', 'Scan'),
      u('GET', '/scan/address-internal-transactions', 'Get Address Internal Transactions', 'Scan'),
      u('GET', '/scan/ether-balance', 'Get Address Ether Balance', 'Scan'),
      u('GET', '/scan/ether-balances', 'Get Address Ether Balances', 'Scan'),
      u('GET', '/scan/erc20-balance', 'Get Address ERC-20 Balance', 'Scan'),
      u('GET', '/scan/erc20-transfers', 'Get Address ERC-20 Transfers', 'Scan'),
      u('GET', '/scan/erc721-transfers', 'Get Address ERC-721 Transfers', 'Scan'),
      u('GET', '/scan/erc1155-transfers', 'Get Address ERC-1155 Transfers', 'Scan'),
      u('GET', '/scan/event-logs', 'Get Address Event Logs', 'Scan'),
      u('GET', '/scan/event-logs-by-topic', 'Get Address Event Logs by Topic', 'Scan'),
      u('GET', '/scan/event-logs-by-block', 'Get Event Logs by Block', 'Scan'),
      u('GET', '/scan/contract-abi', 'Get Contract ABI', 'Scan'),
      u('GET', '/scan/contract-source', 'Get Contract Source Code', 'Scan'),
      u('GET', '/scan/contract-creator', 'Get Contract Creator Info', 'Scan'),
      u('GET', '/scan/contract-execution-status', 'Get Contract Execution Status', 'Scan'),
      u('GET', '/scan/gas-price-tiers', 'Get Gas Price Tiers', 'Scan'),
      u('GET', '/scan/block-rewards', 'Get Block Rewards', 'Scan'),
      u('GET', '/scan/block-number-by-time', 'Get Block Number by Time', 'Scan'),
      u('GET', '/scan/block-mining-eta', 'Get Block Mining ETA', 'Scan'),
      u('GET', '/scan/native-supply', 'Get Ether Supply Summary', 'Scan'),
      u('GET', '/scan/erc20-supply', 'Get ERC-20 Supply', 'Scan'),
      u('GET', '/scan/native-token-price', 'Get Native Token Price', 'Scan'),
      u('GET', '/scan/node-count', 'Get Node Count', 'Scan'),
      u('GET', '/scan/blockchain-size-history', 'Get Blockchain Size History', 'Scan'),
      u('GET', '/scan/beacon-withdrawals', 'Get Beacon Chain Withdrawals by Address', 'Scan'),
      u('GET', '/scan/transaction-confirmation-time', 'Get Transaction Confirmation Time', 'Scan'),
      u('GET', '/scan/transaction-execution-status', 'Get Transaction Execution Status', 'Scan'),
      u('POST', '/scan/contract-verify', 'Verify Contract Source', 'Scan'),
      u('POST', '/scan/contract-verify-proxy', 'Verify Proxy Contract Source', 'Scan'),
    ],
  },
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'Subscribe to address activity and contract events. No polling.',
    endpoints: [
      u('POST', '/webhook/address', 'Create Address Webhook', 'Webhook'),
      u('POST', '/webhook/contract', 'Create Contract Webhook', 'Webhook'),
      u('POST', '/webhook/solana-address', 'Create Solana Address Webhook', 'Webhook'),
      u('GET', '/webhook', 'Get All Webhooks', 'Webhook'),
      u('GET', '/webhook/{id}', 'Get Webhook Details', 'Webhook'),
      u('POST', '/webhook/{id}', 'Update Webhook Details', 'Webhook'),
      u('POST', '/webhook/{id}/delete', 'Delete Webhook by ID', 'Webhook'),
    ],
  },
];

export const unifiedEndpointCount = unifiedCategories.reduce(
  (total, category) => total + category.endpoints.length,
  0,
);

/* ============================================================
   Direct APIs: provider-native endpoints, proxied
   ============================================================ */

export type ProviderTag = 'spotlight' | 'hyperliquid';

export type DirectProvider = {
  id: string;
  name: string;
  subtitle: string;
  /** Undefined when no artwork ships for this provider, so a monogram is drawn. */
  icon?: string;
  endpointCount: number;
  /** Real category list from the Direct API providers overview. */
  categories: string[];
  /** Real endpoint list, where transcribed from the provider reference page. */
  endpoints: ApiEndpoint[];
  docsUrl: string;
  tag?: ProviderTag;
  /** Shown on featured cards. */
  blurb?: string;
};

const providerIcon = (file: string) => `/assets/icons/providers/${file}`;
const docs = (slug: string) =>
  `https://docs.uniblock.dev/reference/direct/direct-providers/direct-api-${slug}`;

const d = (method: Method, path: string, title: string, category: string): ApiEndpoint => ({
  method,
  path,
  title,
  category,
});

export const directProviders: DirectProvider[] = [
  {
    id: 'kraken',
    name: 'Kraken',
    subtitle: 'Centralized exchange & derivatives',
    icon: providerIcon('Kraken.webp'),
    endpointCount: 55,
    categories: ['Centralized Finance', 'Historical', 'Market Data', 'Token', 'Trading', 'Utility', 'Wallets'],
    docsUrl: docs('kraken'),
    tag: 'spotlight',
    blurb: 'Spot and futures market data, order books, OHLC candles, fills, and account history.',
    endpoints: [
      d('GET', 'direct/v1/Kraken/0/public/Ticker', 'Get ticker information for all or requested markets', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/OHLC', 'Retrieve OHLC market data', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/Depth', 'Get level 2 order book with aggregated quantities', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/Spread', 'Get the last ~200 top-of-book spreads for a pair', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/Trades', 'Get the most recent trades for a pair', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/AssetPairs', 'Get tradable asset pairs', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/GroupedBook', 'Aggregate order book volume over a tick range', 'Market Data'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/orderbook', 'Get the full order book for listed futures', 'Market Data'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/instruments', 'Get specifications for all listed markets', 'Market Data'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/historical-funding-rates', 'Get historical funding rates for a market', 'Market Data'),
      d('GET', 'direct/v1/Kraken/0/public/Assets', 'Get assets available for deposit, withdrawal and trading', 'Token'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/openorders', 'Get all open orders for all futures contracts', 'Trading'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/openpositions', 'Get size and average entry price of open positions', 'Trading'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/fills', 'Get filled orders for all futures contracts', 'Trading'),
      d('GET', 'direct/v1/Kraken/api/history/v3/orders', 'List order events for the authenticated account', 'Trading'),
      d('GET', 'direct/v1/Kraken/api/history/v3/executions', 'List executions and trades for the account', 'Trading'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/rfqs', 'Retrieve all currently open RFQs', 'Trading'),
      d('GET', 'direct/v1/Kraken/api/history/v3/positions', 'List position events for the authenticated account', 'Centralized Finance'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/feeschedules', 'List all fee schedules', 'Centralized Finance'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/accounts', 'Get account information, balances and margin', 'Wallets'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/subaccounts', 'Get subaccount balances and UIDs', 'Wallets'),
      d('GET', 'direct/v1/Kraken/api/history/v3/account-log', 'List account log entries, paged by time or ID', 'Wallets'),
      d('GET', 'direct/v1/Kraken/0/public/Time', "Get the server's time", 'Utility'),
      d('GET', 'direct/v1/Kraken/0/public/SystemStatus', 'Get current system status or trading mode', 'Utility'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/notifications', 'Get platform notifications', 'Utility'),
      d('GET', 'direct/v1/Kraken/derivatives/api/v3/assignmentprogram/history', 'Get assignment program change history', 'Historical'),
    ],
  },
  {
    id: 'polymarket',
    name: 'Polymarket',
    subtitle: 'Prediction markets',
    icon: providerIcon('Polymarket.webp'),
    endpointCount: 59,
    categories: [
      'Balance', 'Historical', 'Liquidity', 'Market Data', 'Metadata', 'Other',
      'Prediction Markets', 'Price', 'Ramp', 'SocialFi', 'Trading', 'Utility',
    ],
    docsUrl: docs('polymarket'),
    tag: 'spotlight',
    blurb: 'Live markets, order books, midpoints, positions, leaderboards, and profile activity.',
    endpoints: [
      d('GET', 'direct/v1/Polymarket/gamma/markets', 'List markets', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/gamma/markets/{id}', 'Get market by id', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/gamma/markets/slug/{slug}', 'Get market by slug', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/gamma/events', 'List events', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/gamma/events/{id}', 'Get event by id', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/clob/simplified-markets', 'Get simplified markets', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/data/live-volume', 'Get live volume for an event', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/data/oi', 'Get open interest', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/data/holders', 'Get top holders for markets', 'Market Data'),
      d('GET', 'direct/v1/Polymarket/clob/book', 'Get order book', 'Liquidity'),
      d('GET', 'direct/v1/Polymarket/clob/price', 'Get market price', 'Price'),
      d('GET', 'direct/v1/Polymarket/clob/prices', 'Get market prices', 'Price'),
      d('GET', 'direct/v1/Polymarket/clob/midpoint', 'Get midpoint price', 'Price'),
      d('GET', 'direct/v1/Polymarket/clob/last-trade-price', 'Get last trade price', 'Price'),
      d('GET', 'direct/v1/Polymarket/clob/spread', 'Get spread', 'Price'),
      d('GET', 'direct/v1/Polymarket/clob/prices-history', 'Get prices history', 'Historical'),
      d('GET', 'direct/v1/Polymarket/data/positions', 'Get current positions for a user', 'Balance'),
      d('GET', 'direct/v1/Polymarket/data/closed-positions', 'Get closed positions for a user', 'Balance'),
      d('GET', 'direct/v1/Polymarket/data/value', "Get total value of a user's positions", 'Balance'),
      d('GET', 'direct/v1/Polymarket/data/v1/market-positions', 'Get positions for a market', 'Balance'),
      d('GET', 'direct/v1/Polymarket/data/trades', 'Get trades for a user or markets', 'Trading'),
      d('GET', 'direct/v1/Polymarket/data/activity', 'Get user activity', 'Trading'),
      d('GET', 'direct/v1/Polymarket/data/v1/leaderboard', 'Get trader leaderboard rankings', 'Trading'),
      d('GET', 'direct/v1/Polymarket/gamma/comments', 'List comments', 'SocialFi'),
      d('GET', 'direct/v1/Polymarket/gamma/profile', 'Get profile positions and activity', 'SocialFi'),
      d('GET', 'direct/v1/Polymarket/gamma/public-profile', 'Get public profile by wallet address', 'SocialFi'),
      d('GET', 'direct/v1/Polymarket/gamma/tags', 'List tags', 'Metadata'),
      d('GET', 'direct/v1/Polymarket/gamma/series', 'List series', 'Metadata'),
      d('GET', 'direct/v1/Polymarket/bridge/supported-assets', 'Get supported assets', 'Ramp'),
      d('GET', 'direct/v1/Polymarket/bridge/status/{address}', 'Get transaction status', 'Ramp'),
      d('GET', 'direct/v1/Polymarket/gamma/search', 'Search markets, events, and profiles', 'Utility'),
      d('GET', 'direct/v1/Polymarket/clob/time', 'Get server time', 'Utility'),
    ],
  },
  {
    id: 'alchemy',
    name: 'Alchemy',
    subtitle: 'Ethereum & L2 infra suite',
    icon: providerIcon('Alchemy.webp'),
    endpointCount: 29,
    categories: ['DeFi', 'Market Data', 'NFT', 'Other', 'Token', 'Wallets'],
    docsUrl: docs('alchemy'),
    tag: 'hyperliquid',
    blurb: 'Hyperliquid info endpoint alongside the full NFT and token pricing suite.',
    endpoints: [
      d('POST', 'direct/v1/Alchemy/hyperliquid/info', 'Hyperliquid info endpoint', 'Other'),
      d('GET', 'direct/v1/Alchemy/prices/v1/tokens/by-symbol', 'Get current prices for tokens by symbol', 'Market Data'),
      d('POST', 'direct/v1/Alchemy/prices/v1/tokens/by-address', 'Get current prices by network and address', 'Market Data'),
      d('POST', 'direct/v1/Alchemy/prices/v1/tokens/historical', 'Get historical price data for a token', 'Market Data'),
      d('POST', 'direct/v1/Alchemy/{chain}/v2', 'Chain-specific JSON-RPC operations', 'Token'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getNFTsForOwner', 'Get all NFTs owned by an address', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getNFTMetadata', 'Get metadata for an individual NFT', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getCollectionMetadata', 'Get collection-level information', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getFloorPrice', 'Get floor prices across marketplaces', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getNFTSales', 'Get NFT sales from on-chain marketplaces', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/computeRarity', 'Compute rarity of each NFT attribute', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getOwnersForNFT', 'Get owners of a specific token', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getOwnersForContract', 'Get owners for a contract', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/isSpamContract', 'Check whether a contract is marked spam', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/isAirdropNFT', 'Check whether a token is an airdrop', 'NFT'),
      d('POST', 'direct/v1/Alchemy/{chain}/nft/v3/refreshNftMetadata', 'Refresh cached metadata for an NFT', 'NFT'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/getCollectionsForOwner', "Get an owner's NFT collections", 'Wallets'),
      d('GET', 'direct/v1/Alchemy/{chain}/nft/v3/isHolderOfContract', 'Verify wallet NFT ownership', 'Wallets'),
    ],
  },
  {
    id: 'goldrush',
    name: 'GoldRush',
    subtitle: 'Cross-chain on-chain data',
    icon: providerIcon('GoldRush.svg'),
    endpointCount: 48,
    categories: ['DeFi', 'Market Data', 'NFT', 'Scan', 'Token', 'Transaction', 'Wallets'],
    docsUrl: docs('goldrush'),
    tag: 'hyperliquid',
    blurb: 'Complete data layer for Hyperliquid with no rate limits, plus multichain balances.',
    endpoints: [
      d('POST', 'direct/v1/GoldRush/hypercore/info', 'Hyperliquid data layer with no rate limits', 'Market Data'),
      d('GET', 'direct/v1/GoldRush/v1/allchains/address/{walletAddress}/balances', 'Get balances across up to 10 EVM chains', 'Token'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/balances_v2', 'Get token balances for an address', 'Token'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/historical_balances', 'Get historical token balances', 'Token'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/portfolio_v2', 'Render a daily portfolio balance by token', 'Token'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/tokens/{tokenAddress}/token_holders_v2', 'Get token holders at any block height', 'Token'),
      d('GET', 'direct/v1/GoldRush/v1/pricing/historical_by_addresses_v2/{chainName}/{quoteCurrency}/{contractAddress}', 'Get historical token prices', 'Market Data'),
      d('GET', 'direct/v1/GoldRush/v1/pricing/spot_prices/{chainName}/pools/{contractAddress}', 'Get spot token pair prices for a pool', 'DeFi'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/balances_nft', 'Get NFTs for an address', 'NFT'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/nft/{contractAddress}/metadata', 'Get NFTs from a contract with metadata', 'NFT'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/nft/collections', 'Get chain collections', 'NFT'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/nft_market/{contractAddress}/floor_price', 'Get historical floor prices', 'NFT'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/nft/{collectionContract}/traits', 'Get traits for a collection', 'NFT'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/transactions_v3', 'Get recent transactions for an address', 'Transaction'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/transaction_v2/{txHash}', 'Get a transaction', 'Transaction'),
      d('GET', 'direct/v1/GoldRush/v1/allchains/transactions', 'Get multichain, multiaddress transactions', 'Transaction'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/transfers_v2', 'Get ERC-20 transfers for an address', 'Transaction'),
      d('GET', 'direct/v1/GoldRush/v1/chains', 'Get all chains', 'Scan'),
      d('GET', 'direct/v1/GoldRush/v1/chains/status', 'Get all chain statuses', 'Scan'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/events', 'Get logs', 'Scan'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/events/address/{contractAddress}', 'Get log events by contract address', 'Scan'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/event/{eventType}/gas_prices', 'Get gas prices', 'Scan'),
      d('GET', 'direct/v1/GoldRush/v1/address/{walletAddress}/activity', 'Get activity across all chains', 'Wallets'),
      d('GET', 'direct/v1/GoldRush/v1/{chainName}/address/{walletAddress}/resolve_address', 'Resolve a registered address', 'Wallets'),
      d('GET', 'direct/v1/GoldRush/v1/btc-mainnet/address/{walletAddress}/balances_v2', 'Get Bitcoin balances for a non-HD address', 'Wallets'),
    ],
  },
  {
    id: 'dwellir',
    name: 'Dwellir',
    subtitle: 'Hyperliquid node infrastructure',
    endpointCount: 1,
    categories: ['Other'],
    docsUrl: docs('dwellir'),
    tag: 'hyperliquid',
    blurb: 'Single Hyperliquid info endpoint. The operation is selected via the request body.',
    endpoints: [
      d('POST', 'direct/v1/Dwellir/hyperliquid/info', 'Hyperliquid info endpoint, set the type field in the body', 'Other'),
    ],
  },

  /* ---- Remaining providers: real counts and categories from the overview ---- */
  {
    id: 'moralis', name: 'Moralis', subtitle: 'Web3 data & auth APIs', icon: providerIcon('Moralis.webp'),
    endpointCount: 111, docsUrl: docs('moralis'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'Other', 'Scan', 'SocialFi', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'hellomoon', name: 'HelloMoon', subtitle: 'Solana analytics & indexing', icon: providerIcon('HelloMoon.webp'),
    endpointCount: 180, docsUrl: docs('hellomoon'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'SocialFi', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'quicknode', name: 'QuickNode', subtitle: 'High-performance RPC', icon: providerIcon('QuickNode.webp'),
    endpointCount: 117, docsUrl: docs('quicknode'), endpoints: [],
    categories: ['Other'],
  },
  {
    id: 'tonapi', name: 'TonAPI', subtitle: 'TON blockchain data', icon: providerIcon('TonAPI.webp'),
    endpointCount: 92, docsUrl: docs('tonapi'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'Scan', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'birdeye', name: 'Birdeye', subtitle: 'Solana DEX & token data', icon: providerIcon('Birdeye.webp'),
    endpointCount: 83, docsUrl: docs('birdeye'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'Scan', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'mempool', name: 'Mempool', subtitle: 'Bitcoin mempool & blocks', icon: providerIcon('Mempool.webp'),
    endpointCount: 83, docsUrl: docs('mempool'), endpoints: [],
    categories: ['Other'],
  },
  {
    id: 'coinmarketcap', name: 'CoinMarketCap', subtitle: 'Market caps & rankings', icon: providerIcon('CoinMarketCap.webp'),
    endpointCount: 81, docsUrl: docs('coinmarketcap'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'Other', 'Prediction Markets', 'Scan', 'SocialFi', 'Stablecoins', 'Token', 'Transactions'],
  },
  {
    id: 'coingecko', name: 'CoinGecko', subtitle: 'Token prices & metadata', icon: providerIcon('CoinGecko.webp'),
    endpointCount: 79, docsUrl: docs('coingecko'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'Other', 'SocialFi', 'Token', 'Wallets'],
  },
  {
    id: 'shyft', name: 'Shyft', subtitle: 'Solana APIs & callbacks', icon: providerIcon('Shyft.webp'),
    endpointCount: 79, docsUrl: docs('shyft'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'Scan', 'SocialFi', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'codex', name: 'Codex', subtitle: 'Real-time token & DEX data',
    endpointCount: 61, docsUrl: docs('codex'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'solscan', name: 'SolScan', subtitle: 'Solana explorer data', icon: providerIcon('SolScan.webp'),
    endpointCount: 47, docsUrl: docs('solscan'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'Other', 'Scan', 'SocialFi', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'allium', name: 'Allium', subtitle: 'Enterprise blockchain data',
    endpointCount: 44, docsUrl: docs('allium'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'Prediction Markets', 'Scan', 'Stablecoins', 'Token', 'Transaction', 'Wallets'],
  },
  {
    id: 'magiceden', name: 'MagicEden', subtitle: 'Multi-chain NFT marketplace', icon: providerIcon('MagicEden.webp'),
    endpointCount: 41, docsUrl: docs('magiceden'), endpoints: [],
    categories: ['Other'],
  },
  {
    id: 'lunarcrush', name: 'LunarCrush', subtitle: 'Social & sentiment metrics', icon: providerIcon('LunarCrush.webp'),
    endpointCount: 32, docsUrl: docs('lunarcrush'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'NFT', 'SocialFi', 'Token'],
  },
  {
    id: 'xstocks', name: 'XStocks', subtitle: 'Tokenized equities',
    endpointCount: 24, docsUrl: docs('xstocks'), endpoints: [],
    categories: ['Other'],
  },
  {
    id: 'geniidata', name: 'GeniiData', subtitle: 'Ordinals & inscriptions', icon: providerIcon('GeniiData.webp'),
    endpointCount: 23, docsUrl: docs('geniidata'), endpoints: [],
    categories: ['Other'],
  },
  {
    id: 'zerion', name: 'Zerion', subtitle: 'Wallet portfolios & DeFi',
    endpointCount: 20, docsUrl: docs('zerion'), endpoints: [],
    categories: ['Other'],
  },
  {
    id: 'helius', name: 'Helius', subtitle: 'Best for Solana coverage', icon: providerIcon('Helius.webp'),
    endpointCount: 2, docsUrl: docs('helius'), endpoints: [],
    categories: ['Transaction'],
  },
  {
    id: 'hydromancer', name: 'Hydromancer', subtitle: 'DeFi market intelligence',
    endpointCount: 1, docsUrl: docs('hydromancer'), endpoints: [],
    categories: ['DeFi', 'Market Data', 'Wallets'],
  },
];

export const directProviderCount = directProviders.length;
export const directEndpointCount = directProviders.reduce(
  (total, provider) => total + provider.endpointCount,
  0,
);

export const spotlightProviders = directProviders.filter((p) => p.tag === 'spotlight');
export const hyperliquidProviders = directProviders.filter((p) => p.tag === 'hyperliquid');
export const standardProviders = directProviders.filter((p) => !p.tag);

/** Platform-level figures published on docs.uniblock.dev. */
export const platformStats = {
  chains: '300+',
  rpcProviders: '55+',
};

/** Groups a flat endpoint list into its categories, preserving first-seen order. */
export function groupByCategory(endpoints: ApiEndpoint[]) {
  const groups = new Map<string, ApiEndpoint[]>();
  for (const endpoint of endpoints) {
    const existing = groups.get(endpoint.category);
    if (existing) existing.push(endpoint);
    else groups.set(endpoint.category, [endpoint]);
  }
  return [...groups.entries()].map(([category, items]) => ({ category, endpoints: items }));
}
