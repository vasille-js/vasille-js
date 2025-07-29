import { Fragment, App, reportError, IValue, Reference, Runner } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

type Composed<Node, Element, TagOptions extends object, In extends CompositionProps, Out> = (
    node: Fragment<Node, Element, TagOptions>,
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
function create<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
    name: string,
): Composed<Node, Element, TagOptions, In, Out> {
    return function (node, props, slot) {
        const frag = new Fragment<Node, Element, TagOptions, object>(props, node.runner, name);

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
            reportError(e);
        }
    };
}

export function compose<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
    name: string,
): Composed<Node, Element, TagOptions, In, Out> {
    return create<Node, Element, TagOptions, In, Out>(renderer, name);
}

export function mount<Node, Element, TagOptions extends object, T>(
    tag: Element,
    component: (node: Fragment<Node, Element, TagOptions>, $: T) => unknown,
    runner: Runner<Node, Element, TagOptions>,
    $: T,
) {
    const root = new App(tag, runner, {});
    const frag = new Fragment({}, runner, ":app-root");

    root.create(frag, function () {
        component(frag, $);
    });
}
