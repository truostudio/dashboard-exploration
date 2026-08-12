import { unifiedCategories, directProviders } from './catalog';
import { rpcForChain, rpcMethodCount } from './jsonRpcMethods';
import { docChain } from './chains';
import type { RpcNamespace } from './jsonRpcMethods';
import type { ApiEndpoint } from './catalog';

/**
 * Which surfaces reach a given chain, and what you can actually call there.
 *
 * Transcribed from the docs rather than invented. JSON-RPC coverage is now a
 * fact rather than a rule, `chains.ts` is the reference's own chain list and
 * `jsonRpcMethods.ts` its method pages, so only the two surfaces the docs
 * describe in prose are still derived:
 *
 *   Unified API  "Major EVM chains + Solana"
 *   Market Data  400+ chains, i.e. everything we list
 *
 * `stated` tracks the difference, because a derived answer should not be
 * presented with the same confidence as a documented one.
 */

export type Surface = 'jsonRpc' | 'unified' | 'marketData';

export type ChainCoverage = {
  jsonRpc: boolean;
  unified: boolean;
  marketData: boolean;
  /** True when the docs name this chain outright rather than us inferring it. */
  stated: boolean;
};

/**
 * JSON-RPC coverage is no longer inferred: every chain in the directory came
 * from the JSON-RPC reference itself, so "is it covered" is "does the reference
 * publish methods for it", which is a fact we now hold.
 */
export function coverageFor(id: string, category: string): ChainCoverage {
  const chain = docChain(id);
  const methods = chain ? rpcMethodCount(chain.chainId) : 0;
  return {
    jsonRpc: methods > 0,
    // "400+ chains" for market data, i.e. everything in this directory.
    marketData: true,
    // "Major EVM chains + Solana", an L2 is EVM, anything else is not covered
    // by that sentence, so we do not claim it.
    unified: category === 'evm' || category === 'l2' || category === 'solana',
    // The chain's own reference page is the statement.
    stated: Boolean(chain),
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

/**
 * Unified categories that are not a chain's data.
 *
 * `webhook` manages subscriptions and `meta` is the catalogue querying itself,
 * both project-level. `json-rpc` is the raw node route, which the readout
 * already reports as its own surface, so listing it again as a one-endpoint
 * category just put "JSON-RPC" on the page twice.
 */
const NOT_CHAIN_DATA = new Set(['webhook', 'json-rpc', 'meta']);

/** Categories native to one chain, keyed by the chain ids they belong to. */
const CHAIN_NATIVE: Record<string, string[]> = {
  hyperliquid: ['hyperliquid'],
  ton: ['toncoin'],
  stellar: ['stellar', 'stellar-soroban'],
};

export type ChainEndpoints = {
  /** Direct-provider endpoints whose own path or title names this chain. */
  direct: (ApiEndpoint & { owner: string })[];
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
 * REST catalogue is chain-agnostic (that is the product's pitch), so it is
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
  const chain = docChain(id);

  // A substring match was fine against a few hundred endpoints and is not fine
  // against fourteen hundred: "base" is inside eth_baseFee, coinbase, and
  // database. So a path has to carry the chain as a whole segment, and a title
  // has to carry the chain's name capitalised, "Get Base block height" is
  // about the chain, "get the base fee" is not.
  const segment = id.toLowerCase();
  const named = chain
    ? new RegExp(`(^|[^A-Za-z])${chain.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z]|$)`)
    : null;

  // Direct only. The Unified catalogue is chain-agnostic and already reported
  // above, so folding it in here listed the same endpoints twice, on
  // Hyperliquid that was 62 Unified operations padding out what is meant to be
  // the provider-native list.
  // One row per path. A provider files an endpoint under every category it fits,
  // so GoldRush's Bitcoin balance call arrives here three times, which listed
  // it three times, and collided on its React key while doing so. The chain view
  // does not group by category, so unique paths is the honest count.
  const seen = new Set<string>();
  const direct = directProviders
    .flatMap((p) => p.endpoints.map((e) => ({ ...e, owner: p.name })))
    .filter(
      (e) =>
        e.path.toLowerCase().split(/[/?&=]/).includes(segment) ||
        (named ? named.test(e.title) : false),
    )
    .filter((e) => {
      const key = `${e.owner}:${e.method}:${e.path}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Not every Unified category is chain data. Three are project-level surfaces
  // rather than something you can ask a chain for, and three are native to one
  // chain each, listing TON HTTP under Ethereum would be claiming coverage that
  // does not exist, and dropping it from Toncoin would be hiding coverage that
  // does. A chain-native category therefore ignores the general EVM/Solana rule
  // and answers only to its own chain.
  const applicable = unifiedCategories.filter((c) => {
    if (NOT_CHAIN_DATA.has(c.id)) return false;
    const only = CHAIN_NATIVE[c.id];
    return only ? only.includes(id) : cov.unified;
  });

  const categories = applicable.map((c) => ({
    id: c.id,
    label: c.label,
    count: c.endpoints.length,
  }));

  // The list is the categories, so the two can never disagree.
  const unified = applicable.flatMap((c) =>
    c.endpoints.map((e) => ({ ...e, owner: c.label })),
  );

  const providers = directProviders
    .filter((p) => PROVIDER_CHAINS[p.id]?.includes(id))
    .map((p) => ({ id: p.id, name: p.name, endpointCount: p.endpointCount }));

  // Keyed on the chain id the docs use, which is the numeric chainId for EVM
  // networks and a slug for the rest.
  const rpc = rpcForChain(chainId ?? id);

  return {
    direct,
    categories,
    unified,
    providers,
    unifiedTotal: unified.length,
    rpc,
    rpcTotal: rpcMethodCount(chainId ?? id),
  };
}
