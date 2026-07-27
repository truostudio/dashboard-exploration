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
  body:
    'Unified Web3 API layer for multi-chain development. Access 300+ blockchains including ' +
    'Ethereum, Solana, Hyperliquid, and 55+ providers through a single, reliable interface. ' +
    'Simple integration, enterprise-grade infrastructure, best price-to-performance ratio.',
  primary: 'GET YOUR API KEY',
  secondary: 'VIEW DOCS',
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

export const trusted = {
  title: 'Trusted by serious Web3 teams',
  // Set as wordmarks in the system's own type rather than imported logo art.
  customers: ['Polymarket', 'Hypernative', 'Stellar', 'pump.fun', 'plume', 'terrace'],
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
  tabs: ['MARKET DATA', 'NFT', 'SCAN', 'TOKEN', '+ MORE'],
  endpoints: [
    { method: 'GET' as const, path: 'uni/v1/market-data/price', title: 'Gets the price of a token.' },
    { method: 'GET' as const, path: 'uni/v1/market-data/market-cap', title: 'Gets the market cap of a token.' },
    { method: 'GET' as const, path: 'uni/v1/market-data/24-hour-volume', title: 'Gets the 24 hour volume of a token.' },
    { method: 'GET' as const, path: 'uni/v1/market-data/history', title: 'Gets the price, volume, market cap of a token at a given date.' },
  ],
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

/* ---------------- 8 · Customer story ---------------- */

export const customerStory = {
  eyebrow: 'CUSTOMER STORY',
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
  stats: [
    { id: 'cost', label: 'RPC cost reduction', value: '30%' },
    { id: 'layer', label: 'Routing layers retired', value: '1' },
  ],
};

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

/* ---------------- 12 · Closing CTA + footer ---------------- */

export const closing = {
  title: 'Build with a team you can reach',
  body:
    'Production-grade multi-chain infrastructure, backed by engineers who understand your ' +
    'workload.',
  cta: 'GET YOUR UNIFIED ENDPOINT',
};

export const footer = {
  tagline: ['Every Blockchain API.', 'One Interface.'],
  columns: [
    {
      id: 'quick',
      label: 'QUICK LINKS',
      links: [
        { label: 'Glossary', href: 'https://www.uniblock.dev/glossary' },
        { label: 'Contact', href: 'https://www.uniblock.dev/contact' },
        { label: 'About', href: 'https://www.uniblock.dev/about' },
        { label: 'Docs', href: 'https://docs.uniblock.dev/' },
        { label: 'Branding', href: 'https://www.uniblock.dev/branding' },
      ],
    },
    {
      id: 'nav',
      label: 'NAVIGATIONS',
      links: [
        { label: 'Pricing', href: 'https://www.uniblock.dev/pricing' },
        { label: 'Integrations', href: 'https://www.uniblock.dev/integrations' },
        { label: 'Chains', href: 'https://www.uniblock.dev/chains' },
        { label: 'Blog', href: 'https://www.uniblock.dev/blog' },
        { label: 'Nodes', href: 'https://www.uniblock.dev/nodes' },
      ],
    },
  ],
  social: [
    { label: 'Linkedin', href: 'https://www.linkedin.com/company/uniblock' },
    { label: 'Twitter (X)', href: 'https://x.com/uniblockdev' },
  ],
  copyright: '©2026 Uniblock',
  legal: [
    { label: 'Privacy Policy', href: 'https://www.uniblock.dev/privacy-policy' },
    { label: 'Terms of Service', href: 'https://www.uniblock.dev/terms-of-service' },
  ],
};
