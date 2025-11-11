import { Fragment, App, reportError, Runner, Reactive, Destroyable } from "vasille";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

export type Composed<Node, Element, TagOptions extends object, In extends CompositionProps, Out> = (
    $: In & { callback?(data: Out | undefined): void },
    node?: Fragment<Node, Element, TagOptions>,
    slot?: In["slot"],
) => void;

export function view<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
): Composed<Node, Element, TagOptions, In, Out> {
    return function (props, node, slot) {
        const { callback } = props;

        if (!node) {
            throw new Error("Vasille: Component context is missing");
        }
        const frag = new Fragment<Node, Element, TagOptions>(node.runner);

        if (slot) {
            props.slot = slot;
        }
        node.create(frag);

        try {
            const result = renderer(frag, props);

            if (result !== undefined && result !== null && callback) {
                callback(result);
            }
        } catch (e) {
            reportError(e);
        }
    };
}

export function store<Out extends object>(fn: (ctx: Reactive) => Out): Out {
    return fn(new Reactive());
}

export function model<In extends object, Out extends object>(
    fn: (ctx: Reactive, o: In) => Out,
): (o: In) => Out & Destroyable {
    return o => {
        const ctx = new Reactive();

        return {
            ...fn(ctx, o),
            destroy() {
                ctx.destroy();
            },
        };
    };
}

export function mount<Node, Element, TagOptions extends object, T>(
    tag: Element,
    view: ($: T, node: Fragment<Node, Element, TagOptions>) => unknown,
    runner: Runner<Node, Element, TagOptions>,
    $: T,
): App<Node, Element, TagOptions> {
    const root = new App<Node, Element, TagOptions>(tag, runner);
    const frag = new Fragment<Node, Element, TagOptions>(runner);

    root.create(frag, function () {
        view($, frag);
    });

    return root;
}
