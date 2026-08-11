import { unifiedCategories, directProviders } from './catalog';
import { rpcForChain, rpcMethodCount } from './jsonRpcMethods';
import type { RpcNamespace } from './jsonRpcMethods';
import type { ApiEndpoint } from './catalog';

/**
 * Which surfaces reach a given chain, and what you can actually call there.
 *
 * Transcribed from the docs rather than invented: the per-chain matrix is
 * `chains/overview.mdx`, the provider-to-chain mapping is the "Available
 * providers" table in `api-reference/direct-api.mdx`, and the fallback rules
 * below are the prose on the same pages:
 *
 *   JSON-RPC     300+ chains, i.e. everything we list
 *   Unified API  "Major EVM chains + Solana"
 *   Market Data  400+ chains, i.e. everything we list
 *
 * Where the docs state a chain explicitly, the table wins. Everything else
 * falls back to the rules, which is why `stated` is tracked — a derived answer
 * should not be presented with the same confidence as a documented one.
 */

export type Surface = 'jsonRpc' | 'unified' | 'marketData';

export type ChainCoverage = {
  jsonRpc: boolean;
  unified: boolean;
  marketData: boolean;
  /** True when the docs name this chain outright rather than us inferring it. */
  stated: boolean;
};

/** The "Popular chains" table in chains/overview.mdx, verbatim. */
const DOCUMENTED: Record<string, Omit<ChainCoverage, 'stated'>> = {
  ethereum:  { jsonRpc: true, unified: true,  marketData: true },
  polygon:   { jsonRpc: true, unified: true,  marketData: true },
  arbitrum:  { jsonRpc: true, unified: true,  marketData: true },
  base:      { jsonRpc: true, unified: true,  marketData: true },
  optimism:  { jsonRpc: true, unified: true,  marketData: true },
  bnb:       { jsonRpc: true, unified: true,  marketData: true },
  avalanche: { jsonRpc: true, unified: true,  marketData: true },
  solana:    { jsonRpc: true, unified: true,  marketData: true },
  bitcoin:   { jsonRpc: true, unified: false, marketData: true },
};

export function coverageFor(id: string, category: string): ChainCoverage {
  const stated = DOCUMENTED[id];
  if (stated) return { ...stated, stated: true };
  return {
    jsonRpc: true,
    marketData: true,
    // "Major EVM chains + Solana" — an L2 is EVM, anything else is not covered
    // by that sentence, so we do not claim it.
    unified: category === 'evm' || category === 'l2' || category === 'solana',
    stated: false,
  };
}

/**
 * Direct providers whose documented remit names a chain. Only Helius is
 * chain-scoped in the provider table; the rest are multi-chain, so claiming a
 * specific chain for them would be inventing coverage.
 */
const PROVIDER_CHAINS: Record<string, string[]> = {
  helius: ['solana'],
};

export type ChainEndpoints = {
  /** Endpoints whose own path names this chain. */
  specific: (ApiEndpoint & { owner: string })[];
  /** Unified categories reachable on this chain, with endpoint counts. */
  categories: { id: string; label: string; count: number }[];
  /** The Unified endpoints themselves, in catalogue order. */
  unified: (ApiEndpoint & { owner: string })[];
  /** Direct providers documented as serving this chain. */
  providers: { id: string; name: string; endpointCount: number }[];
  unifiedTotal: number;
  /** JSON-RPC namespaces published for this chain, method by method. */
  rpc: RpcNamespace[];
  rpcTotal: number;
};

/**
 * Endpoints affiliated with a chain.
 *
 * Two different shapes, because the two surfaces genuinely differ. The Unified
 * REST catalogue is chain-agnostic — that is the product's pitch — so it is
 * reported as coverage plus anything naming the chain in its own path. The
 * JSON-RPC surface is emphatically not: each chain publishes its own namespaces
 * and methods, so those come from the per-chain reference verbatim.
 */
export function endpointsForChain(
  id: string,
  category: string,
  chainId?: string | number,
): ChainEndpoints {
  const cov = coverageFor(id, category);
  const needle = id.toLowerCase();

  const specific = [
    ...unifiedCategories.flatMap((c) =>
      c.endpoints.map((e) => ({ ...e, owner: c.label })),
    ),
    ...directProviders.flatMap((p) => p.endpoints.map((e) => ({ ...e, owner: p.name }))),
  ].filter((e) => e.path.toLowerCase().includes(needle) || e.title.toLowerCase().includes(needle));

  const categories = cov.unified
    ? unifiedCategories.map((c) => ({ id: c.id, label: c.label, count: c.endpoints.length }))
    : [];

  const unified = cov.unified
    ? unifiedCategories.flatMap((c) => c.endpoints.map((e) => ({ ...e, owner: c.label })))
    : [];

  const providers = directProviders
    .filter((p) => PROVIDER_CHAINS[p.id]?.includes(id))
    .map((p) => ({ id: p.id, name: p.name, endpointCount: p.endpointCount }));

  // Keyed on the chain id the docs use, which is the numeric chainId for EVM
  // networks and a slug for the rest.
  const rpc = rpcForChain(chainId ?? id);

  return {
    specific,
    categories,
    unified,
    providers,
    unifiedTotal: unified.length,
    rpc,
    rpcTotal: rpcMethodCount(chainId ?? id),
  };
}
