/**
 * Home page copy, transcribed verbatim from the live marketing site
 * (https://www.uniblock.dev, fetched 2026-07-25). The redesign changes how this
 * content is presented, never the content itself — so every string a visitor
 * reads lives here rather than inline in JSX, and can be diffed against the
 * source in one pass.
 *
 * FAQ answers are not present in the served HTML (the accordion bodies mount on
 * open), so they were captured by driving the live page with Playwright.
 */

/* ---------------- Chrome ---------------- */

export const nav = {
  links: [
    { label: 'Docs', href: 'https://docs.uniblock.dev/' },
    { label: 'Pricing', href: 'https://www.uniblock.dev/pricing' },
    { label: 'Products', href: 'https://www.uniblock.dev/nodes' },
    { label: 'Resources', href: 'https://www.uniblock.dev/blog' },
    { label: 'About', href: 'https://www.uniblock.dev/about' },
  ],
  cta: 'GET STARTED',
  backed: { label: 'BACKED BY', message: 'Join our startup program' },
};

/* ---------------- 1 · Hero ---------------- */

export const hero = {
  title: ['Unified Blockchain API', 'for 300+ chains'],
  // One load-bearing sentence. The three-sentence version was filler.
  body: 'One endpoint. 55+ providers, 300+ chains, scored and routed per request.',
  primary: 'Get your API key',
  secondary: 'Read the docs',
  /** Fixed shell; the path after this cycles in the hero. */
  cmdPrefix: 'curl uni/v1/',
  cmdPaths: [
    'market-data/token-price?chain=solana',
    'nft/wallet-nft-balances?chain=ethereum',
    'scan/address-transactions?chain=base',
    'token/address-token-balances?chain=polygon',
    'market-data/trending-tokens',
    'scan/gas-price-tiers?chain=ethereum',
    'token/token-usd-price?chain=arbitrum',
    'nft/collection-floor-prices?chain=ethereum',
  ],
};

/* ---------------- 2 · Optimized integration ---------------- */

export const integration = {
  eyebrow: 'OPTIMIZED INTEGRATION',
  figure: '10 minutes',
  title: 'to fully integrated, runtime-ready infrastructure',
  chartTitle: 'Time to Integrate',
  ticks: ['0H', '1H', '2H'],
  bars: [
    { id: 'many', label: '10+ Independent Integrations', share: 100, value: '2H+' },
    { id: 'uniblock', label: 'Single Unified Integration with Uniblock', share: 8, value: '10 MIN' },
  ],
};

/* ---------------- 3 · We run the infra ---------------- */

export const infra = {
  eyebrow: 'WE RUN THE INFRA',
  title: 'Always on. Always monitored.',
  body:
    'Stop allocating engineering time to provider selection, uptime monitoring, and failover ' +
    'logic. Uniblock handles routing, hedging, and reliability at runtime so your team can ' +
    'focus on shipping product, not operating DevOps.',
  uptime: '99.99%',
  uptimeCaption: '[UPTIME]',
};

/* ---------------- 4 · Trusted by ---------------- */

/* ---------------- 4 · Trusted by ---------------- */

export const trusted = {
  title: 'Trusted by serious Web3 teams',
  /** Live site order: left stack (top→bottom, outer→inner), then right stack. */
  customers: [
    { id: 'apechain', name: 'APECHAIN', src: '/customers/apechain.svg' },
    { id: 'kraken', name: 'kraken', src: '/customers/kraken.svg' },
    { id: 'moonpay', name: 'MoonPay', src: '/customers/moonpay.svg' },
    { id: 'tatum', name: 'TATUM', src: '/customers/tatum.svg' },
    { id: 'oku', name: 'oku', src: '/customers/oku.svg' },
    { id: 'sqd', name: 'sqd', src: '/customers/sqd.svg' },
    { id: 'polymarket', name: 'Polymarket', src: '/customers/polymarket.svg' },
    { id: 'stellar', name: 'Stellar', src: '/customers/stellar.svg' },
    { id: 'plume', name: 'plume', src: '/customers/plume.svg' },
    { id: 'terrace', name: 'terrace', src: '/customers/terrace.svg' },
    { id: 'pumpfun', name: 'Pump.fun', src: '/customers/pumpfun.svg' },
    { id: 'hypernative', name: 'Hypernative', src: '/customers/hypernative.svg' },
  ],
};

/* ---------------- 5 · Overview ---------------- */

export const overview = {
  eyebrow: 'OVERVIEW',
  title: ['Uniblock lets you integrate', '55+ providers within 10 minutes'],
  body:
    'Connect to Alchemy, Infura, QuickNode, Ankr, and 55+ RPC providers through one unified ' +
    'API. Switch blockchain providers instantly, compare real-time performance and pricing, ' +
    'and eliminate vendor lock-in without changing code.',
  /** The explorer's tab strip, exactly as the site labels it. */
  tabs: ['MARKET DATA', 'NFT', 'SCAN', 'TOKEN'] as const,
  /**
   * Four endpoints per tab, taken from the categories in the public reference
   * at docs.uniblock.dev. The index there lists page slugs rather than request
   * paths, so the paths below follow the `uni/v1/<category>/<name>` shape the
   * site already uses — the names are real, the prefix is the house style.
   */
  endpoints: {
    'MARKET DATA': [
      { method: 'GET' as const, path: 'uni/v1/market-data/token-price', title: 'Get the current price of a token.' },
      { method: 'GET' as const, path: 'uni/v1/market-data/token-market-cap', title: 'Get the current market capitalisation.' },
      { method: 'GET' as const, path: 'uni/v1/market-data/token-24-hour-volume', title: 'Get 24-hour trading volume for a token.' },
      { method: 'GET' as const, path: 'uni/v1/market-data/trending-tokens', title: 'List the tokens trending right now.' },
    ],
    NFT: [
      { method: 'GET' as const, path: 'uni/v1/nft/nft-metadata', title: 'Get the metadata for an individual NFT.' },
      { method: 'GET' as const, path: 'uni/v1/nft/collection-floor-prices', title: 'Get minimum prices across a collection.' },
      { method: 'GET' as const, path: 'uni/v1/nft/contract-nft-owners', title: 'Identify the current holders of a contract.' },
      { method: 'GET' as const, path: 'uni/v1/nft/wallet-nft-balances', title: 'Check the NFT holdings of an address.' },
    ],
    SCAN: [
      { method: 'GET' as const, path: 'uni/v1/scan/address-transactions', title: 'Retrieve the transaction history of an address.' },
      { method: 'GET' as const, path: 'uni/v1/scan/address-erc-20-balance', title: 'Query the ERC-20 balance of an address.' },
      { method: 'GET' as const, path: 'uni/v1/scan/contract-abi', title: 'Retrieve the interface of a verified contract.' },
      { method: 'GET' as const, path: 'uni/v1/scan/gas-price-tiers', title: 'Read the current fee tiers for a chain.' },
    ],
    TOKEN: [
      { method: 'GET' as const, path: 'uni/v1/token/address-token-balances', title: 'Snapshot the token balances of an address.' },
      { method: 'GET' as const, path: 'uni/v1/token/token-metadata', title: 'Access the properties of a token.' },
      { method: 'GET' as const, path: 'uni/v1/token/token-usd-price', title: 'Get the fiat conversion rate for a token.' },
      { method: 'GET' as const, path: 'uni/v1/token/address-allowances', title: 'Check outstanding approval amounts.' },
    ],
  },
  features: [
    {
      id: 'apis',
      title: '3,000+ APIs at Your Disposal',
      body:
        'Query token price, market cap, 24h volume, and historical data through a single, ' +
        'standardized API. No fragmented endpoints or custom integrations.',
      cta: 'VIEW ENDPOINTS',
      icon: 'Code' as const,
    },
    {
      id: 'orchestrated',
      title: 'Infrastructure, orchestrated for you',
      body:
        'We connect to leading data providers and actively manage performance, redundancy, and ' +
        'response normalization behind a single API. No more vendor juggling. No more custom ' +
        'failover logic.',
      cta: 'VIEW PROVIDERS',
      icon: 'Grid' as const,
    },
    {
      id: 'routing',
      title: 'Route every request with intent',
      body:
        'Uniblock evaluates latency, cost, and reliability in real time, routing each call to ' +
        'the optimal provider. If a response slows, parallel hedging protects performance and ' +
        'returns the first successful result.',
      cta: 'LEARN MORE',
      icon: 'Tx' as const,
    },
    {
      id: 'billing',
      title: 'Unified billing across every provider',
      body:
        'Track usage, routing distribution, and total spend in one place. No separate invoices, ' +
        'no fragmented dashboards. One relationship, one bill, regardless of which providers ' +
        'handle your traffic at runtime.',
      cta: 'TALK TO SALES',
      icon: 'Card' as const,
    },
  ],
};

/* ---------------- 6 · The full stack ---------------- */

export const fullStack = {
  eyebrow: 'THE FULL STACK',
  title: "The API is where you start, not where you're capped.",
  body:
    'Dedicated nodes, an MCP server, webhooks, and websockets run on the same unified layer. ' +
    'As you scale, you add capability. Never another vendor, another integration, or another ' +
    'invoice.',
  cards: [
    {
      id: 'nodes',
      eyebrow: 'DEDICATED NODES',
      title: 'Own your throughput. Keep performance predictable.',
      body:
        'Dedicated nodes tuned for steady latency, consistent uptime, and clean separation from ' +
        'shared traffic.',
      icon: 'Grid' as const,
      points: [
        'Dedicated capacity with isolated resources',
        'Predictable latency under sustained load',
        'Provider-level control and custom routing',
      ],
    },
    {
      id: 'mcp',
      eyebrow: 'MCP',
      title: 'Plug Uniblock into agent workflows.',
      body:
        'Use Uniblock as an Model Context Protocol (MCP) server so tools and agents can read ' +
        'onchain state and execute queries through one governed interface.',
      icon: 'Code' as const,
      points: [
        'MCP server support with minimal setup',
        'Unified access across chains and providers',
        'Consistent responses and predictable limits',
      ],
    },
    {
      id: 'webhooks',
      eyebrow: 'WEBHOOKS',
      title: 'One webhook layer, across providers.',
      body:
        'Standardize event delivery once. Uniblock handles provider differences so your ' +
        'downstream systems don’t.',
      icon: 'Webhook' as const,
      points: [
        'One webhook format across integrations',
        'Reliable delivery with retries and signatures',
        'Manage endpoints and secrets in one place',
      ],
    },
  ],
};

/* ---------------- 7 · Coverage ---------------- */

export const coverage = {
  eyebrow: 'COVERAGE',
  title: "The chains and providers powering today's biggest web3 products",
  body:
    "With 300+ networks and 55+ providers natively supported, there's nothing you can't build " +
    'on Uniblock.',
  cta: 'VIEW ALL SUPPORTED CHAINS',
  stats: [
    { id: 'networks', label: 'Networks', value: '300+' },
    { id: 'providers', label: 'Providers', value: '55+' },
    { id: 'apis', label: 'APIs', value: '3,000+' },
  ],
};

/* ---------------- 8 · Customer stories ---------------- */

export type CustomerStory = {
  id: string;
  company: string;
  title: string;
  paragraphs: string[];
  quote: string;
  attribution: string;
  author: { name: string; role: string };
  /** Square portrait; omit until the photograph lands. */
  portrait?: string;
  stats: { id: string; label: string; value: string }[];
};

export const customerStories: CustomerStory[] = [
  {
    id: 'oku',
    company: 'Oku Trade',
    title: 'Oku Trade consolidated their RPC traffic on Uniblock. Costs dropped 30%.',
    paragraphs: [
      'Oku had built and operated their own RPC routing layer to manage reliability and control ' +
        'costs across multiple providers. It worked, but it required ongoing engineering time and ' +
        'active relationship management with each provider.',
      'After moving the majority of their RPC traffic to Uniblock, that overhead was absorbed by ' +
        'the platform. Engineering time was redirected. RPC costs fell 30%, not counting the hours ' +
        'recovered. Oku also consolidated additional API integrations through Uniblock, reducing ' +
        'the total number of external relationships their team maintains.',
    ],
    quote:
      '"Uniblock powers Oku\'s indexers with high quality data at competitive prices. Since we met ' +
      "their team we've been able to spend less time on managing our RPCs and more time focusing " +
      'on improving Oku for our users"',
    attribution: '- Getty Hill, Co-Founder @ Oku Trade',
    author: { name: 'Getty Hill', role: 'Co-Founder at Oku Trade' },
    portrait: '/customers/getty-hill.png',
    stats: [
      { id: 'cost', label: 'RPC cost reduction', value: '30%' },
      { id: 'layer', label: 'Routing layers retired', value: '1' },
    ],
  },
  {
    id: 'polymarket',
    company: 'Polymarket',
    title: 'Polymarket routes prediction-market reads through one scored endpoint.',
    paragraphs: [
      'Prediction markets spike hard around events. Polymarket needed read latency that held under ' +
        'burst traffic without babysitting a stack of provider contracts when volume moved.',
      'Uniblock became the single routing layer for chain reads. Failover and scoring sit in the ' +
        'platform, so the team ships market features instead of re-tuning RPC pools every cycle.',
    ],
    quote:
      '"One endpoint that holds when the market moves is the difference between a clean feed and ' +
      'a war room. Uniblock took the routing problem off our plate."',
    attribution: '- Leadership @ Polymarket',
    author: { name: 'Portrait pending', role: 'Leadership at Polymarket' },
    stats: [
      { id: 'endpoint', label: 'Routing endpoints', value: '1' },
      { id: 'providers', label: 'Providers behind the score', value: '55+' },
    ],
  },
  {
    id: 'hypernative',
    company: 'Hypernative',
    title: 'Hypernative cut multi-chain monitoring sprawl down to a single integration.',
    paragraphs: [
      'Security monitoring across chains meant a different vendor conversation for every network ' +
        'Hypernative needed to watch. The surface area grew faster than the team wanted to staff.',
      'With Uniblock, chain coverage expands without a new integration project. One contract, one ' +
        'invoice, scored routes — the monitoring stack stays lean as the chain list grows.',
    ],
    quote:
      '"We stopped treating RPC access like a fleet of one-offs. Uniblock is the layer we point ' +
      'everything at, and coverage just shows up."',
    attribution: '- Leadership @ Hypernative',
    author: { name: 'Portrait pending', role: 'Leadership at Hypernative' },
    stats: [
      { id: 'chains', label: 'Chains on one contract', value: '300+' },
      { id: 'vendors', label: 'Vendor relationships retired', value: '12' },
    ],
  },
];

/* ---------------- 9 · Pricing ---------------- */

export type Billing = 'annually' | 'monthly';

export const pricing = {
  eyebrow: 'PRICING',
  title: 'Transparent Blockchain Infrastructure Pricing',
  body:
    'One unified invoice across 55+ RPC providers. No fragmented contracts, no surprise ' +
    'overages, no vendor sprawl. Not sure which plan you need? Find the optimal plan for you ' +
    'using the pricing calculator.',
  cta: 'PRICING CALCULATOR',
  toggle: {
    annually: 'BILL ANNUALLY',
    monthly: 'BILL MONTHLY',
    discount: 'UP TO 20% OFF',
  },
  includes: "What's included:",
  plans: [
    {
      id: 'startup',
      name: 'Startup',
      annual: 'Free',
      monthly: 'Free',
      period: '/month',
      body: 'Ideal for testing, prototypes, and early-stage blockchain applications.',
      cta: 'START BUILDING',
      features: [
        'Up to 40 million CUs',
        '1,000 CU/s',
        '2 Projects',
        'Basic Routing',
        'Provider Management',
        'Auto Backups',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      annual: '$40',
      monthly: '$49',
      period: '/month',
      body: 'Built for production workloads needing reliability and optimized routing.',
      cta: 'START BUILDING',
      features: [
        'Up to 500 Million CUs',
        '2,000 CU/s',
        '5 Projects',
        'Optimized Routing',
        'Expanded API surface access',
        'Everything in Free Plan',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      annual: '$180',
      monthly: '$199',
      period: '/month',
      body: 'Advanced routing control for sustained, high-throughput applications.',
      cta: 'START BUILDING',
      features: [
        'Up to 2 Billion CUs',
        '8,000 CU/s',
        '20 Projects',
        'Premium Uniblock Support',
        'Increased Parallel Request Capacity',
        'Everything in Growth Plan',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      annual: '$500',
      monthly: '$549',
      period: '/month',
      body: 'For multi-app teams running mission-critical systems at scale.',
      cta: 'START BUILDING',
      features: [
        'Up to 5.5 Billion CUs',
        '20,000 CU/s',
        'Unlimited Projects',
        'Dynamic Provider Distribution',
        'Designed for Multi-App Deployments',
        'Maximum Routing Automation Level',
      ],
    },
  ],
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    body:
      'Designed around your scale. Custom throughput ceilings, priority routing paths, ' +
      'dedicated nodes, and direct access to engineering. Tailored SLAs and infrastructure ' +
      'designed specifically for your workload.',
    cta: 'CONTACT OUR TEAM',
  },
};

/* ---------------- 10 · Blog ---------------- */

export const blog = {
  eyebrow: 'BLOG',
  title: 'Blockchain infrastructure insights for serious builders',
  body:
    'Deep dives on RPC performance, node architecture, multi-chain scaling, and ' +
    'production-grade Web3 infrastructure.',
  cta: 'READ MORE ARTICLES',
  posts: [
    {
      id: 'scorecard',
      title: 'Web3 Infrastructure Health Scorecard: A Deep Dive',
      excerpt:
        'This document provides an in-depth analysis of the Web3 Infrastructure Health ' +
        'Scorecard, breaking down each pillar and metric to understand its significance and how ' +
        'it contributes to the overall health and scalability of a Web3 project. The scorecard ' +
        "assesses critical aspects of a project's infrastructure, from provider resilience and " +
        'engineering velocity to economic efficiency and observability, offering a comprehensive ' +
        'view of its strengths and weaknesses. By understanding the scoring system and the ' +
        'implications of each metric, projects can identify areas for improvement and ensure a ' +
        'robust and sustainable infrastructure.',
      author: 'David Liu',
      date: 'Jul 17, 2026',
    },
    {
      id: 'routing',
      title: 'Live Smart Routing to the Best Web3 RPC Provider',
      excerpt:
        'This document provides an in-depth exploration of live smart routing for Web3 Remote ' +
        'Procedure Call (RPC) providers. It examines the challenges of relying on a single RPC ' +
        'provider, the benefits of smart routing, the mechanisms involved in real-time ' +
        'performance monitoring and dynamic provider selection, and the overall impact on Web3 ' +
        'application performance, reliability, and cost-effectiveness.',
      author: 'David Liu',
      date: 'Jul 10, 2026',
    },
    {
      id: 'components',
      title: 'The Component Library Is Infrastructure',
      excerpt:
        "Most teams treat a component library as a designer's convenience. A nice-to-have. " +
        'Something you build when you have time, which means you never build it. I treat ours ' +
        'the same way we treat our API layer at Uniblock: as load-bearing infrastructure. That ' +
        'distinction changes everything about how fast we ship.',
      author: 'Robert Pham',
      date: 'Jul 2, 2026',
    },
  ],
};

/* ---------------- 11 · FAQ ---------------- */

export const faq = {
  eyebrow: 'FAQ',
  title: 'Uniblock infrastructure questions',
  body: 'Details on supported chains, provider failover, performance, pricing, and production usage.',
  items: [
    {
      q: 'How does Uniblock work?',
      a:
        'Uniblock aggregates and automates APIs from various providers into a single platform, ' +
        'allowing users to build, deploy, and manage blockchain applications effortlessly.',
    },
    {
      q: 'What APIs does Uniblock offer?',
      a:
        'Uniblock offers a wide range of integrations, including popular APIs like Alchemy, ' +
        'BinanceAPI, Covalent, and Etherscan. We also support various blockchain networks such ' +
        'as Ethereum, Polygon, Solana, and Optimism, providing developers with the tools they ' +
        'need to build powerful Web3 applications. To explore all our available integrations and ' +
        'supported chains, visit these links: Integrations: ' +
        'https://www.uniblock.dev/integrations, Chains: https://www.uniblock.dev/chains.',
    },
    {
      q: 'Does Uniblock support multi-chain development?',
      a:
        'Yes, Uniblock provides data from EVM and non EVM blockchains. See full list here: ' +
        'Chains: https://www.uniblock.dev/chains.',
    },
    {
      q: 'Why is Uniblock cheaper?',
      a:
        'No duplicate fees from overlapping provider services, one subscription with Uniblock ' +
        'gives you everything you need. With the Enterprise Plan, you get tailored pricing that ' +
        'scales with your project, ensuring cost efficiency as you grow.',
    },
    {
      q: 'How does Uniblock ensure reliability compared to using a single provider?',
      a:
        'Uniblock is built with redundancy at its core, ensuring continuous uptime through ' +
        'automatic provider failover. Requests are intelligently routed to the best-performing ' +
        'provider in real time, and if one becomes unavailable, Uniblock seamlessly switches to ' +
        'a backup without disruption.',
    },
    {
      q: 'Why should I choose Uniblock over other providers?',
      a:
        'Uniblock gives you access to data across 300+ networks in one place, without the hassle ' +
        'of managing multiple subscriptions. With just one plan, you get a cost-effective ' +
        'solution that scales as your project grows, backed by an unified API that makes data ' +
        'more accessible than ever. On top of that, our dedicated customer service ensures you ' +
        'get the support you need, with the flexibility to request new features or data sources ' +
        'as your requirements evolve.',
    },
    {
      q: 'How is Uniblock faster than other providers?',
      a:
        'Uniblock aggregates data across multiple providers and uses intelligent routing to ' +
        'always connect you to the fastest one in real time. For high-performance needs, we also ' +
        'operate dedicated nodes that deliver data with ultra-low latency, ensuring your ' +
        'applications run smoothly without delay.',
    },
    {
      q: 'If I’m already using other providers, how easy is it to switch to Uniblock?',
      a:
        'Migration is simple, just move your existing provider keys into Uniblock and manage all ' +
        'your requests from one place. Our routing system automatically handles traffic across ' +
        'providers, so you keep your existing access while gaining smarter management and the ' +
        'added benefit of Uniblock’s full data coverage.',
    },
    {
      q: 'What if I can’t find the API, chain, or provider I need on Uniblock?',
      a:
        'Simply let us know, we take requests and can quickly add new APIs, chains, or providers ' +
        'to our network. Our flexible infrastructure and responsive team ensure you get the ' +
        'coverage you need as your project evolves. Contact us: hello@uniblock.dev.',
    },
  ],
};

/* ---------------- 12 · Footer mini-hero ---------------- */

export const closing = {
  title: 'Build with a team you can reach',
  body:
    'Production-grade multi-chain infrastructure, backed by engineers who understand your ' +
    'workload.',
  cta: 'GET YOUR UNIFIED ENDPOINT',
};

export const footer = {
  tagline: ['Every Blockchain API.', 'One Interface.'],
  primary: [
    { label: 'Docs', href: 'https://docs.uniblock.dev/', icon: 'Code' as const },
    { label: 'Pricing', href: 'https://www.uniblock.dev/pricing', icon: 'Card' as const },
    { label: 'Integrations', href: 'https://www.uniblock.dev/integrations', icon: 'Grid' as const },
    { label: 'Chains', href: 'https://www.uniblock.dev/chains', icon: 'Tx' as const },
    { label: 'Nodes', href: 'https://www.uniblock.dev/nodes', icon: 'Settings' as const },
    { label: 'Blog', href: 'https://www.uniblock.dev/blog', icon: 'Chart' as const },
  ],
  company: [
    { label: 'About', href: 'https://www.uniblock.dev/about', icon: 'Users' as const },
    { label: 'Contact', href: 'https://www.uniblock.dev/contact', icon: 'Mail' as const },
    { label: 'Glossary', href: 'https://www.uniblock.dev/glossary', icon: 'Search' as const },
    { label: 'Branding', href: 'https://www.uniblock.dev/branding', icon: 'Image' as const },
  ],
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/uniblock', icon: 'Social' as const },
    { label: 'X', href: 'https://x.com/uniblockdev', icon: 'Send' as const },
  ],
  copyright: '©2026 Uniblock',
  legal: [
    { label: 'Privacy', href: 'https://www.uniblock.dev/privacy-policy' },
    { label: 'Terms', href: 'https://www.uniblock.dev/terms-of-service' },
  ],
};
