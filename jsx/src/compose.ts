import { Extension, Fragment, config } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

type Composed<In extends CompositionProps, Out> = (
    this: Fragment,
    $: In & { callback?(data: Out | undefined): void },
    slot?: In["slot"],
) => void;

function create<In extends CompositionProps, Out>(
    renderer: (this: Fragment, input: In) => Out,
    create: (parent: Fragment, props: In) => Fragment,
    name: string,
): Composed<In, Out> {
    return function (props, slot) {
        const frag = create(this, props);

        if (slot) {
            props.slot = slot;
        }
        this.create(frag);

        try {
            const result = renderer.call(frag, props);

            if (result !== undefined && props.callback) {
                props.callback(result);
            }
        } catch (e) {
            if (config.debugUi) {
                console.error(`Vasille: Error found in component ${name}`, e);
            }
            reportError(e);
        }
    };
}

export function compose<In extends CompositionProps, Out>(
    renderer: (this: Fragment, input: In) => Out,
    name: string,
): Composed<In, Out> {
    return create<In, Out>(
        renderer,
        (parent, props) => {
            return new Fragment<object>(parent, props, name);
        },
        name,
    );
}

export function extend<In extends CompositionProps, Out>(
    renderer: (this: Fragment, input: In) => Out,
    name: string,
): Composed<In, Out> {
    return create<In, Out>(
        renderer,
        (parent: Fragment, props: In) => {
            return new Extension(parent, props, name);
        },
        name,
    );
}
