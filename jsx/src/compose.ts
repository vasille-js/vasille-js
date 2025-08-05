import { Fragment, App, reportError, IValue, Reference, Runner } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

export type Composed<Node, Element, TagOptions extends object, In extends CompositionProps, Out> = (
    $: In & { callback?(data: Out | undefined): void },
    node?: Fragment<Node, Element, TagOptions>,
    slot?: In["slot"],
) => void;

function create<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    node: Fragment<Node, Element, TagOptions> | undefined,
    renderer: (node: Fragment<Node, Element, TagOptions>, props: In) => Out,
    props: In,
    callback: ((data: Out | undefined) => void) | undefined,
    slot: In["slot"] | undefined,
    name: string,
) {
    if (!node) {
        throw new Error("Vasille: Component context is missing");
    }
    const frag = new Fragment<Node, Element, TagOptions, object>(props, node.runner, name);

    if (slot) {
        props.slot = slot;
    }
    node.create(frag);

    try {
        const result = renderer(frag, props);

        if (result !== undefined && callback) {
            callback(result);
        }
    } catch (e) {
        reportError(e);
    }
}

export function mvvmView<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
    name: string,
): Composed<Node, Element, TagOptions, In, Out> {
    return function (props, node, slot) {
        create(
            node,
            renderer,
            new Proxy(props, {
                get(target: object, p: string | symbol): any {
                    return p in target && target[p] instanceof IValue ? target[p] : new Reference(target[p]);
                },
            }) as In,
            props.callback,
            slot,
            name,
        );
    };
}

export function mvcView<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
    name: string,
): Composed<Node, Element, TagOptions, In, Out> {
    return function (props, node, slot) {
        create(node, renderer, props, props.callback, slot, name);
    };
}

export function hybridView<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
    modelProps: string[],
    name: string,
): Composed<Node, Element, TagOptions, In, Out> {
    const modelPropsSet = new Set<string | symbol>(modelProps);

    return function (props, node, slot) {
        create(
            node,
            renderer,
            new Proxy(props, {
                get(target: object, p: string | symbol): any {
                    return modelPropsSet.has(p)
                        ? p in target
                            ? target[p]
                            : undefined
                        : p in target && target[p] instanceof IValue
                          ? target[p]
                          : new Reference(target[p]);
                },
            }) as In,
            props.callback,
            slot,
            name,
        );
    };
}

export function mount<Node, Element, TagOptions extends object, T>(
    tag: Element,
    view: ($: T, node: Fragment<Node, Element, TagOptions>) => unknown,
    runner: Runner<Node, Element, TagOptions>,
    $: T,
): App<Node, Element, TagOptions> {
    const root = new App(tag, runner, {});
    const frag = new Fragment({}, runner, ":app-root");

    root.create(frag, function () {
        view($, frag);
    });

    return root;
}
