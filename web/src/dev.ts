import { Fragment, Portal, reportError } from "vasille";
import { Runner, TagOptions } from "vasille/web-runner";
import { devMount as coreMount } from "vasille-jsx/dev";
import { devRouteApp as coreRouteApp } from "vasille-router/dev";
import { DevFragment, DevPortal, DevRunner, DevTagOptions, Inspector, Position } from "vasille/dev";
import { modal, prompt, PromptProps } from "./index.js";
import { WebRouterInitialization } from "vasille-router/web-router";

function getInspector(node: Fragment<Node, Element, TagOptions>) {
    return "inspector" in node ? (node.inspector as Inspector) : undefined;
}

function createPortal(
    node: Fragment<Node, Element, TagOptions>,
    declaration: Position | undefined,
    usage: Position | undefined,
    name: string | undefined,
) {
    const portal = new DevPortal<Node, Element, TagOptions>(
        { node: document.body },
        node.runner,
        getInspector(node),
        declaration,
        usage,
        name,
    );

    node.create(portal);

    return portal;
}

export function devModal<T extends object>(
    modalFn: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
    declaration: Position,
    name: string,
): (input: T, node: Fragment<Node, Element, TagOptions>, usage: Position | undefined) => void {
    return (input, node, usage) => {
        modal(modalFn, node => createPortal(node, declaration, usage, name))(input, node);
    };
}

export function devPrompt<T extends PromptProps>(
    modal: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
    declaration: Position,
    name: string,
): (
    node: Fragment<Node, Element, TagOptions>,
    input: T,
    timeout: number | undefined,
    usage: Position | undefined,
) => Promise<unknown> {
    return function (node, input, timeout, usage) {
        return prompt(modal, node => createPortal(node, declaration, usage, name))(node, input, timeout);
    };
}

export function devMount<T>(element: Element, component: ($: T) => void, input: T, inspector: Inspector) {
    return coreMount<T>(element, component, new DevRunner(window.document, inspector), input, inspector);
}

export function devRouterApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element: Element,
    inspector: Inspector,
) {
    return coreRouteApp(element, window, window.location, init, inspector);
}
