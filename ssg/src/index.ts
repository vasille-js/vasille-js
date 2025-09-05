import { Fragment, Portal } from "vasille";
import { mount as coreMount } from "vasille-jsx";
import { Runner, Node, Element, type TagOptions } from "./runner.js";

export {
    forward,
    backward,
    ensure,
    ref,
    expr,
    expr as bind,
    expr as calculate,
    expr as watch,
    set,
    Debug,
    Delay,
    For,
    Slot,
    Watch,
    store,
    model,
    setModel,
    mapModel,
    arrayModel,
    Switch,
    setErrorHandler,
    match,
} from "vasille-jsx";

export { styleSheet } from "./css.js";
export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "./css.js";

export {
    type QueryParams,
    type ScreenProps,
    type RouteParameters,
    screen,
    screen as page,
    type FallbackScreenProps,
    type ErrorScreenProps,
} from "vasille-router";

export { awaited } from "./awaited.js";
export { routerApp } from "./router.js";

interface CompositionProps {
    slot?: (...args: any[]) => void;
}

export function view<In extends CompositionProps>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => void,
) {
    return (props: In, node?: Fragment<Node, Element, TagOptions>, slot?: In["slot"]) => {
        if (!node) {
            throw new Error("Vasille: Component context is missing");
        }
        const frag = new Fragment<Node, Element, TagOptions>(node.runner);

        if (slot) {
            props.slot = slot;
        }

        node.create(frag);
        renderer(frag, props);
    };
}

export const component = view;
export const compose = view;

export function modal<T extends object>(
    modal: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
): (input: T, node: Fragment<Node, Element, TagOptions>) => void {
    return function (props, node) {
        if (!node) {
            throw new Error("Vasille: Modal context is missing");
        }
        const runner: Runner = node.runner as Runner;
        const portal = new Portal<Node, Element, TagOptions>({ node: runner.body }, runner);

        node.create(portal);
        modal(portal, props);
    };
}

// no prompts support in SSG
export function prompt(): () => Promise<unknown> {
    return function () {
        throw new Error("User input is not supported in SSG");
    };
}

export function mount<T>(component: ($: T) => void, input: T) {
    const head = new Element("head", {});
    const body = new Element("body", {});

    return coreMount<Node, Element, TagOptions, T>(body, component, new Runner(head, body), input);
}
