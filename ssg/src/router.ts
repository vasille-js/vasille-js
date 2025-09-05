import {
    Answer,
    QueryParams,
    Router as AbstractRouter,
    RouterInitialization,
    Routing,
    ScreenProps,
} from "vasille-router";
import { Element, Node, Runner, TagOptions } from "./runner.js";
import { App, Fragment } from "vasille";
import { waitForAsyncData } from "./awaited.js";
import { mountStyles } from "./css.js";

export class Router extends AbstractRouter<Node, Element, TagOptions, string, {}, []> {
    protected readonly runner: Runner;
    protected readonly node: Fragment<Node, Element, TagOptions>;

    public constructor(
        runner: Runner,
        node: Fragment<Node, Element, TagOptions>,
        init: RouterInitialization<Node, Element, TagOptions, string, {}>,
    ) {
        super(init);
        this.runner = runner;
        this.node = node;
    }

    public async render() {
        return await this.renderStatic(this.root, "/", {});
    }

    public async renderStatic(
        routing: Routing<Node, Element, TagOptions, string, {}>,
        prefix: string,
        routes: Record<string, string>,
    ) {
        if (routing.self) {
            const forceFile = prefix.endsWith(".html");
            const dirPath = prefix.slice(1);
            const filePath = forceFile ? dirPath : dirPath + "/index.html";

            routes[filePath] = await this.doNavigate(prefix);
        }

        for (const key in routing.static) {
            await this.renderStatic(routing.static[key], `${prefix}${key}`, routes);
        }

        return routes;
    }

    protected async doNavigate(url: string) {
        console.log(`Rendering ${url}...`);

        await this.prepareNavigation(url, true, true);

        console.dir(this.runner.body);

        return (
            ["<!doctype html>", "<html>", this.runner.head.toHTML(1), this.runner.body.toHTML(1), "</html>"].join(
                "\n",
            ) + "\n"
        );
    }

    protected parseUrl(url: string): [string, QueryParams, string] {
        return [url, {}, ""];
    }

    protected async loadTarget<Route extends string>(
        target: Answer<Node, Element, TagOptions, Route, {}>,
        props: ScreenProps<Route>,
    ): Promise<void> {
        this.runner.head.children.splice(0);
        this.runner.body.children.splice(0);
        this.node.children.clear();
        this.node.lastChild = undefined;

        await this.renderScreen(target.screen, props);
    }

    protected async renderScreen<Props>(
        screen: (props: Props, ctx: Fragment<Node, Element, TagOptions>) => void | Promise<void>,
        props: Props,
    ): Promise<void> {
        await screen(props, this.node);
        await waitForAsyncData();
        mountStyles(this.runner.head);
    }
}

export function routerApp(init: RouterInitialization<Node, Element, TagOptions, string, {}>) {
    const head = new Element("head", {});
    const body = new Element("body", {});
    const runner = new Runner(head, body);
    const app = new App(body, runner);
    const fragment = new Fragment(runner);

    app.create(fragment);
    return new Router(runner, fragment, init);
}
