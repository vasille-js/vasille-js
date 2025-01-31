import { Extension, Fragment, config, App, reportError, IValue, Reference } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

type Composed<In extends CompositionProps, Out> = (
    node: Fragment,
    $: In & { callback?(data: Out | undefined): void },
    slot?: In["slot"],
) => void;

function proxy<T extends object>(obj: T): T {
    return new Proxy(obj, {
        get(target: object, p: string | symbol): any {
            return p in target && target[p] instanceof IValue ? target[p] : new Reference(target[p]);
        },
    }) as T;
}
function create<In extends CompositionProps, Out>(
    renderer: (node: Fragment, input: In) => Out,
    create: (props: In) => Fragment,
    name: string,
): Composed<In, Out> {
    return function (node, props, slot) {
        const frag = create(props);

        if (slot) {
            props.slot = slot;
        }
        node.create(frag);

        try {
            const result = renderer(frag, proxy(props));

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
    renderer: (node: Fragment, input: In) => Out,
    name: string,
): Composed<In, Out> {
    return create<In, Out>(
        renderer,
        props => {
            return new Fragment<object>(props, name);
        },
        name,
    );
}

export function extend<In extends CompositionProps, Out>(
    renderer: (node: Fragment, input: In) => Out,
    name: string,
): Composed<In, Out> {
    return create<In, Out>(
        renderer,
        props => {
            return new Extension(props, name);
        },
        name,
    );
}

export function mount<T>(tag: Element, component: (node: Fragment, $: T) => unknown, $: T) {
    const root = new App(tag, {});
    const frag = new Fragment({}, ":app-root");

    root.create(frag, function () {
        component(frag, $);
    });
}
