import { Extension, Fragment, config, App, reportError, IValue, Reference } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

type Composed<In extends CompositionProps, Out> = (
    this: Fragment,
    $: In & { callback?(data: Out | undefined): void },
    slot?: In["slot"],
) => void;

function proxy(obj: object) {
    return new Proxy(obj, {
        get(target: object, p: string | symbol): any {
            return p in target && target[p] instanceof IValue ? target[p] : new Reference(target[p]);
        },
    });
}
function create<In extends CompositionProps, Out>(
    renderer: (this: Fragment, input: In) => Out,
    create: (props: In) => Fragment,
    name: string,
): Composed<In, Out> {
    return function (props, slot) {
        const frag = create(props);

        if (slot) {
            props.slot = slot;
        }
        this.create(frag);

        try {
            const result = renderer.call(frag, proxy(props));

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
        props => {
            return new Fragment<object>(props, name);
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
        props => {
            return new Extension(props, name);
        },
        name,
    );
}

export function mount<T>(tag: Element, component: (this: Fragment, $: T) => unknown, $: T) {
    const root = new App(tag, {});
    const frag = new Fragment({}, ":app-root");

    root.create(frag, function () {
        component.call(this, $);
    });
}
