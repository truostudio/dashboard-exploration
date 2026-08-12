import { NodesHero } from '../sections/NodesHero';
import { NodesContent } from '../sections/NodesContent';
import { NodesClose } from '../sections/NodesClose';

/** Dedicated Nodes, bare-metal / managed blockchain infrastructure. */
export function NodesPage() {
  return (
    <main>
      <NodesHero />
      <NodesContent />
      <NodesClose />
    </main>
  );
}
