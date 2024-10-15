import {current, Fragment, userError} from "vasille";

interface CompositionProps {
  slot ?: (...args: any[]) => void;
}
export function compose<In extends CompositionProps, Out>(
  renderer: (input: In) => Out
): ($: In & {callback?(data: Out|undefined): void}, slot?: In['slot']) => Out|undefined {
  return (props, slot) => {
    const frag = new Fragment(props);

    if (!(current instanceof Fragment)) {
      throw userError('missing parent node', 'out-of-context');
    }
    if (slot) {
      props.slot = slot;
    }
    current.create(frag);

    return frag.runFunctional(renderer, props);
  }
}
