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
import path from "node:path";
import * as fs from "node:fs/promises";
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

    public async render(outPath: string): Promise<void> {
        await this.renderStatic(outPath, this.root, "/");
    }

    public async renderStatic(
        outPath: string,
        routing: Routing<Node, Element, TagOptions, string, {}>,
        prefix: string,
    ) {
        if (routing.self) {
            const forceFile = prefix.endsWith(".html");
            const dirPath = path.join(outPath, prefix.slice(1));
            const filePath = forceFile ? dirPath : path.join(dirPath, "index.html");

            if (!forceFile) {
                await fs.mkdir(dirPath, { recursive: true });
            }
            await fs.writeFile(filePath, await this.doNavigate(prefix));
        }

        for (const key in routing.static) {
            await this.renderStatic(outPath, routing.static[key], `${prefix}${key}/`);
        }
    }

    protected async doNavigate(url: string) {
        console.log(`Rendering ${url}...`);

        await this.prepareNavigation(url, true, true);

        return ["<!doctype html>", "<html>", this.runner.head.toHTML(1), this.runner.body.toHTML(1), "</html>"].join(
            "\n",
        );
    }

    protected parseUrl(url: string): [string, QueryParams, string] {
        const parsed = new URL(url, "http://127.0.0.1`");
        const query = [...parsed.searchParams.keys()].reduce((prev, key) => {
            return { ...prev, [key]: parsed.searchParams.getAll(key) };
        }, {} as QueryParams);

        return [parsed.pathname, query, parsed.hash];
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

export function routeApp(init: RouterInitialization<Node, Element, TagOptions, string, {}>) {
    const head = new Element("head", {});
    const body = new Element("body", {});
    const runner = new Runner(head, body);
    const app = new App(body, runner);
    const fragment = new Fragment(runner);

    app.create(fragment);
    new Router(runner, fragment, init)
        .render(process.argv[2])
        .catch(e => {
            console.error(e);
        })
        .finally(() => {
            process.exit(0);
        });
}
