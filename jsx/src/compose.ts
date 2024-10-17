import { Extension, Fragment } from "vasille";
import { getCurrent } from "./inline";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

export function compose<In extends CompositionProps, Out>(
    renderer: (input: In) => Out,
): ($: In & { callback?(data: Out | undefined): void }, slot?: In["slot"]) => Out | undefined {
    return (props, slot) => {
        const frag = new Fragment(props);

        if (slot) {
            props.slot = slot;
        }
        getCurrent().create(frag);

        return frag.runFunctional(renderer, props);
    };
}

export function extend<In extends CompositionProps, Out>(
    renderer: (input: In) => Out,
): ($: In & { callback?(data: Out | undefined): void }, slot?: In["slot"]) => Out | undefined {
    return (props, slot) => {
        const extension = new Extension(props);

        if (slot) {
            props.slot = slot;
        }
        getCurrent().create(extension);

        return extension.runFunctional(renderer, props);
    };
}
