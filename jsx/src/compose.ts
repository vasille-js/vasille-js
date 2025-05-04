import { Extension, Fragment, config, App, reportError, IValue } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

type Composed<In extends CompositionProps, Out> = (
    node: Fragment,
    $: In & { callback?(data: Out | undefined): void },
    slot?: In["slot"],
) => void;

function refactor<T extends object>(frag: Fragment, obj: T): T {
    for (const key in obj) {
        if (!(obj[key] instanceof IValue)) {
            obj[key] = frag.ref(obj[key]) as unknown as T[typeof key];
        }
    }

    return obj;
}

function proxy<T extends object>(frag: Fragment, obj: T): T {
    return new Proxy(obj, {
        get(target: object, p: string | symbol): any {
            return p in target && target[p] instanceof IValue ? target[p] : target[p] = frag.ref(target[p]);
        },
    }) as T;
}
function create<In extends CompositionProps, Out>(
    renderer: (node: Fragment, input: In) => Out,
    create: (props: In) => Fragment,
    name: string,
    isExplicit: boolean,
): Composed<In, Out> {
    return function (node, props, slot) {
        const frag = create(props);

        if (slot) {
            props.slot = slot;
        }
        node.create(frag);

        try {
            const callback = props.callback;
            const result = renderer(frag, isExplicit ? refactor(frag, props) : proxy(frag, props));

            if (result !== undefined && callback) {
                callback(result);
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
    isExplicit: boolean,
): Composed<In, Out> {
    return create<In, Out>(
        renderer,
        props => {
            return new Fragment<object>(props, name);
        },
        name,
        isExplicit,
    );
}

export function extend<In extends CompositionProps, Out>(
    renderer: (node: Fragment, input: In) => Out,
    name: string,
    isExplicit: boolean,
): Composed<In, Out> {
    return create<In, Out>(
        renderer,
        props => {
            return new Extension(props, name);
        },
        name,
        isExplicit,
    );
}

export function mount<T>(tag: Element, component: (node: Fragment, $: T) => unknown, $: T) {
    const root = new App(tag, {});
    const frag = new Fragment({}, ":app-root");

    root.create(frag, function () {
        component(frag, $);
    });
}
