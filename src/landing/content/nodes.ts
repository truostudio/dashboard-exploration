/**
 * Dedicated Nodes page copy, transcribed from https://uniblock.dev/nodes
 * (fetched 2026-07-30).
 */

export const nodesPage = {
  eyebrow: 'DEDICATED NODES',
  title: ['Bare-metal servers', 'optimized for blockchain nodes'],
  body:
    'High-performance infrastructure for validators, RPC nodes, and sustained onchain workloads. ' +
    'Run bare metal yourself with full root access, or have us manage the node for an additional fee.',
  cta: 'TALK TO OUR TEAM',
  ctaHref:
    'https://meetings-na3.hubspot.com/thomas-harvie/nodes-booking-page-meeting?uuid=9f1d86f6-2bff-4b88-a808-697fc3bd32bb',
  mapNote:
    'Datacenters sit at each country’s densest interconnection hubs for the lowest practical ' +
    'latency to any target. We don’t publish latency numbers here. Test from any location yourself ' +
    'via our looking glass.',
  lookingGlass: {
    label: 'TEST VIA LOOKING GLASS',
    href: 'https://looking-glass.dedicatednodes.io/',
  },
  stats: [
    { id: 'provision', label: 'Provision', value: '~15 min' },
    { id: 'regions', label: 'Regions', value: '5 sites' },
    { id: 'uptime', label: 'Uptime', value: '99%' },
  ],
  overview: {
    index: '01',
    title: 'Private blockchain infrastructure: yours to run, or ours to manage.',
    body:
      'Take bare-metal servers with full root access and run any chain yourself, or add managed ' +
      'operation for a fee and we keep nodes performant and up to date. Shared traffic can stay on ' +
      'Uniblock routing; use Dedicated when a workload needs reserved capacity.',
  },
  compare: {
    eyebrow: 'SHARED VS DEDICATED',
    title: 'Shared Routing vs Dedicated Nodes',
    lede:
      'Most teams start on Shared. Move specific workloads to Dedicated when performance, ' +
      'isolation, or cost predictability starts to matter.',
    columns: ['Dimension', 'Shared (Uniblock routing)', 'Dedicated Nodes'],
    rows: [
      ['Who shares the servers?', 'Many customers', 'Just your team'],
      [
        'Performance',
        'Strong for most apps; can vary when the network is busy',
        'Steady and predictable under heavy use',
      ],
      ['Best for', 'Everyday traffic, products still growing', 'High-volume or latency-sensitive workloads'],
      ['How you pay', 'Based on usage', 'Fixed capacity (predictable monthly cost)'],
      ['Setup', 'Ready in minutes', 'Configured with our team'],
    ],
    bottom:
      'Bottom line: Most teams start on Shared. Move specific workloads to Dedicated when ' +
      'performance, isolation, or cost predictability starts to matter.',
  },
  options: {
    eyebrow: 'BARE METAL OR MANAGED',
    title: 'Two options to run Dedicated',
    lede: 'Self-run bare metal with full freedom, or let us manage the node so you only consume endpoints.',
    items: [
      {
        id: 'bare',
        num: '01',
        title: 'Bare metal',
        body:
          'Full root access on your own server. Run any blockchain yourself with complete freedom ' +
          'over software, OS, and tuning.',
      },
      {
        id: 'managed',
        num: '02',
        title: 'Managed',
        body:
          'We keep the node performant and up to date. You get the endpoints, and can rent a ' +
          'colocated server in the same facility for your own software (<0.03ms local network).',
      },
    ],
  },
  when: {
    eyebrow: 'WHEN TO CHOOSE DEDICATED',
    title: 'When Dedicated is the right call',
    lede: 'If none of these apply, Shared routing is usually better.',
    items: [
      { id: 'traffic', num: '01', title: 'Heavy, steady traffic', body: 'Lots of requests all day, not just spikes.' },
      {
        id: 'privacy',
        num: '02',
        title: 'Privacy / compliance',
        body: 'Need infrastructure not shared with other teams.',
      },
      {
        id: 'location',
        num: '03',
        title: 'Location or hardware needs',
        body: 'Closer to users, or tuned for the workload.',
      },
      {
        id: 'cost',
        num: '04',
        title: 'Predictable cost at scale',
        body: 'Fixed monthly plan is simpler than per-request.',
      },
    ],
  },
  audience: {
    eyebrow: 'WHO IT’S FOR',
    title: 'Ideal customers for Dedicated Nodes',
    items: [
      'Trading apps and automated bots',
      'DeFi protocols and wallets with heavy activity',
      'Indexers and data-heavy backends',
      'Fintech / regulated products needing isolation',
      'Products where downtime or lag costs users or revenue',
    ],
  },
  steps: {
    eyebrow: 'HOW IT WORKS',
    title: 'Four short steps to Dedicated',
    items: [
      {
        id: 'need',
        num: '01',
        title: 'Tell us what you need',
        body: 'Chains, traffic, region, and compliance requirements.',
      },
      {
        id: 'choose',
        num: '02',
        title: 'Choose bare metal or managed',
        body:
          'Full-root bare metal to run the chain yourself, or managed nodes for an added fee. We ' +
          'keep them performant and up to date.',
      },
      {
        id: 'connect',
        num: '03',
        title: 'Connect with lowest latency',
        body:
          'Managed customers get endpoints plus optional colocated servers in the same facility ' +
          '(<0.03ms local network).',
      },
      {
        id: 'monitor',
        num: '04',
        title: 'Monitor in one place',
        body: 'Same dashboard and API style. One relationship.',
      },
    ],
  },
  capabilities: {
    lede:
      'Hardware selected for peak performance: high clock CPUs, fast memory, and enterprise NVMe, ' +
      'so nodes run exceptionally well even without deep OS or chain tuning.',
    items: [
      {
        id: 'root',
        num: '01',
        title: 'Bare metal, full root',
        body:
          'Unmanaged bare metal with full root access. Dedicated CPU, memory, storage, and bandwidth. ' +
          'No virtualization tax, no noisy neighbors.',
      },
      {
        id: 'hw',
        num: '02',
        title: 'Peak-spec hardware',
        body:
          'Highest clock-speed CPUs, fast memory, and enterprise NVMe with top read/write. The box ' +
          'is already built for extreme performance before you tune anything.',
      },
      {
        id: 'shred',
        num: '03',
        title: 'LocalShred™ (Solana)',
        body:
          'Solana-specific shred delivery. Shreds arrive roughly 4ms faster than Jito shredstream ' +
          'via optimized internal routing. Included on Solana servers, no setup.',
      },
      {
        id: 'xdp',
        num: '04',
        title: 'Full XDP',
        body:
          'Line-rate packet handling on every node, tuned for Solana validator and RPC performance ' +
          'from day one.',
      },
      {
        id: 'ddos',
        num: '05',
        title: 'Edge Anti-DDoS',
        body:
          'Attack traffic filtered at the network edge without adding latency to legitimate gossip, ' +
          'voting, or RPC.',
      },
      {
        id: 'enable',
        num: '06',
        title: '15-minute enable',
        body:
          'In-stock configurations provision the same day, usually within about 15 minutes. Custom ' +
          'builds when you need a different spec.',
      },
    ],
  },
  custom: {
    title: 'Not in stock? We build it.',
    body:
      'Highest-clock CPUs, fast memory, enterprise NVMe, and bandwidth. Setup from next-day to a ' +
      'few weeks depending on parts.',
    note:
      'Specs and pricing reflect current inventory. Memory and NVMe storage prices move with the ' +
      'market. We confirm exact spec and price at order time.',
    cta: 'REQUEST A CUSTOM QUOTE',
    ctaHref: 'https://portal.dedicatednodes.io/contact.php',
  },
  faq: {
    index: '03',
    title: 'Before you order',
    items: [
      {
        q: 'What happens if the exact server I need isn’t in stock?',
        a:
          'We build it. Custom configurations use the same peak-spec parts — highest-clock CPUs, ' +
          'fast memory, enterprise NVMe. Lead times run from next-day to a few weeks depending on parts.',
      },
      {
        q: 'How fast can I actually get a node running?',
        a:
          'In-stock configurations usually provision within about 15 minutes the same day. Custom ' +
          'builds take longer based on component availability.',
      },
      {
        q: 'Do you support Solana-specific configurations?',
        a:
          'Yes. Solana servers include LocalShred™ shred delivery and Full XDP tuned for validator ' +
          'and RPC workloads from day one.',
      },
      {
        q: 'Bare metal or managed: what’s the difference?',
        a:
          'Bare metal gives you full root on your own server. Managed keeps the node performant and ' +
          'up to date — you consume endpoints, with optional colocated servers in the same facility.',
      },
      {
        q: 'Can I run a validator and a trading bot on the same node?',
        a:
          'You can on bare metal with full root. For managed, we size and isolate the workload with ' +
          'you so latency-sensitive processes get the capacity they need.',
      },
      {
        q: 'How is this different from Uniblock’s shared RPC plans?',
        a:
          'Shared routing is multi-tenant and usage-based. Dedicated reserves metal for your team — ' +
          'predictable performance and monthly cost when isolation or steady load matters.',
      },
      {
        q: 'Do prices and specs ever change?',
        a:
          'Memory and NVMe prices move with the market. We confirm exact spec and price at order time ' +
          'against current inventory.',
      },
    ],
  },
  close: {
    title: ['Tell us the workload.', 'We match the metal.'],
    body:
      'Same-day on available servers. Custom-built when you need a Solana validator, RPC, or ' +
      'trading stack we do not stock.',
  },
};
