import { Fragment, Reference } from "vasille";
import { TagOptions } from "vasille/web-runner";
import { Router as AbstractRouter, RouteRenderScope, RouterInitialization } from "../router.js";
import { QueryParams, Answer, ScreenProps, RouteParameters } from "../types.js";

export interface WebRouterInitialization<Routes extends string>
    extends RouterInitialization<Node, Element, TagOptions, Routes, {}> {
    node: Fragment<Node, Element, TagOptions>;
    loadingScreen?(node: Fragment<Node, Element, TagOptions>): void;
    loadingOverlay?(node: Fragment<Node, Element, TagOptions>): void;
    internalError(node: Fragment<Node, Element, TagOptions>, data: { err: string }): void;
}

export type NavigationMode = "silent" | "loading-screen" | "loading-overlay";

function build(
    node: Fragment<Node, Element, TagOptions>,
    run?: (node: Fragment<Node, Element, TagOptions>) => void,
    name?: string,
) {
    const child = new Fragment<Node, Element, TagOptions>({}, node.runner, name);

    node.create(child, run);
}

export class Router<Routes extends string> extends AbstractRouter<
    Node,
    Element,
    TagOptions,
    Routes,
    {},
    [NavigationMode]
> {
    public readonly currentUrl = new Reference<string>("");
    public readonly loadingUrl = new Reference<string | null>(null);

    protected node: Fragment<Node, Element, TagOptions>;
    protected loadingNode: Fragment<Node, Element, TagOptions>;
    protected contentNode: Fragment<Node, Element, TagOptions>;
    protected overlayNode: Fragment<Node, Element, TagOptions>;

    protected loadingScreen?: (node: Fragment<Node, Element, TagOptions>) => void;
    protected loadingOverlay?: (node: Fragment<Node, Element, TagOptions>) => void;
    protected internalError: (node: Fragment<Node, Element, TagOptions>, data: { err: string }) => void;

    public constructor(init: WebRouterInitialization<Routes>) {
        const node = init.node;

        super(init);
        this.node = node;
        this.loadingScreen = init.loadingScreen;
        this.loadingOverlay = init.loadingOverlay;
        this.internalError = init.internalError;
        this.currentUrl.$ = location.pathname;

        build(node, node => (this.loadingNode = node), "router:loading-screen");
        build(node, node => (this.contentNode = node), "router:content-screen");
        build(node, node => (this.overlayNode = node), "router:loading-overlay");

        this.doNavigate(location.href, true, "loading-screen");
    }

    public navigate<T extends Routes>(route: T, params: RouteParameters<T>, mode: NavigationMode) {
        super.navigate(route, params, mode);
    }

    protected doNavigate(url: string, canNavigate: boolean, mode: NavigationMode) {
        this.prepareNavigation(url, canNavigate, mode).catch(e => {
            this.clearLoadings();
            this.renderScreen(this.internalError, { err: `${e}` }, "error").catch(e => {
                console.error("Failed to create internal screen error", e);
            });
        });
    }

    protected parseUrl(url: string): [string, QueryParams, string] {
        const parsed = new URL(url, location.origin);

        return [
            parsed.pathname,
            [...parsed.searchParams.keys()].reduce(
                (prev, key) => {
                    const value = parsed.searchParams.getAll(key);

                    return {
                        ...prev,
                        [key]: value.length === 1 ? value[0] : value,
                    };
                },
                {} as { [k: string]: string | string[] },
            ),
            parsed.hash,
        ];
    }

    protected async loadTarget<Route extends string>(
        target: Answer<Node, Element, TagOptions, Route, {}>,
        props: ScreenProps<Route>,
        mode: NavigationMode,
    ): Promise<void> {
        this.loadingUrl.$ = props.path;

        try {
            const { loadingScreen, loadingOverlay } = this;

            if (mode === "loading-screen" && loadingScreen) {
                this.clearNode(this.contentNode);
                build(this.loadingNode, node => loadingScreen(node), "::");
            }
            if (mode === "loading-overlay" && loadingOverlay) {
                build(this.overlayNode, node => loadingOverlay(node), "::");
            }

            const screen = target.answer200 ?? target.answer301 ?? target.answer404;

            if (screen) {
                await this.renderScreen(screen, props, "found");
            }
        } catch (error) {
            this.clearNode(this.contentNode);
            throw error;
        } finally {
            this.clearLoadings();
            this.loadingUrl.$ = null;
        }
    }

    protected async renderScreen<Props>(
        screen: (ctx: Fragment<Node, Element, TagOptions>, props: Props) => void | Promise<void>,
        props: Props,
        scope: RouteRenderScope,
    ): Promise<void> {
        const children = this.contentNode.children;
        const oldChildren = [...children];
        let ctx: Fragment<Node, Element, TagOptions> | null = null;

        build(this.contentNode, node => (ctx = node), "::");

        if (ctx) {
            await screen(ctx, props);
        }

        oldChildren.forEach(node => {
            node.destroy();
            children.delete(node);
        });

        if (scope === "not-found") {
            history.replaceState({}, "", "/");
        }
    }

    protected clearLoadings(): void {
        this.clearNode(this.loadingNode);
        this.clearNode(this.overlayNode);
    }

    protected clearNode(node: Fragment<Node, Element, TagOptions>) {
        const { children } = node;

        children.forEach(node => node.destroy());
        children.clear();
    }
}
