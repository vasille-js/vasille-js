import { Fragment } from "vasille";
import { Answer, Routing, RouteParameters, QueryParams, ScreenProps, Screen } from "./types.js";

export interface RouterInitialization<
    Node,
    Element,
    TagOptions extends object,
    Routes extends string,
    Extras extends object,
> {
    routes: { [K in Routes]: Answer<Node, Element, TagOptions, K, Extras> };
    getAccessLevel?(): Promise<number>;
    fallbackScreen?(arg: { cause: "not-found" | "no-access" }, ctx: Fragment<Node, Element, TagOptions>): void;
    errorScreen?(data: { error: unknown }, ctx: Fragment<Node, Element, TagOptions>): void;
}

export type RouteRenderScope = "found" | "not-found" | "fallback" | "error";

export function composeUrl<Route extends string>(route: Route, params: RouteParameters<Route>): string {
    return Object.entries(params).reduce<string>((link, [key, value]) => {
        return link.replace(new RegExp(`:${key}\\b`), value);
    }, route);
}

export abstract class Router<
    Node,
    Element,
    TagOptions extends object,
    Routes extends string,
    Extras extends object,
    Args extends unknown[],
> {
    protected root: Routing<Node, Element, TagOptions, Routes, Extras>;
    protected init: RouterInitialization<Node, Element, TagOptions, Routes, Extras>;

    public constructor(init: RouterInitialization<Node, Element, TagOptions, Routes, Extras>) {
        this.root = this.createRouting();
        this.init = init;

        for (const route in init.routes) {
            let it: Routing<Node, Element, TagOptions, Routes, Extras> = this.root;
            const parsedPath = route
                .split("/")
                .filter(value => !!value)
                .map(value => {
                    if (value.startsWith(":")) {
                        return { key: value.substring(1), static: false };
                    } else {
                        return { key: value, static: true };
                    }
                });
            const target = init.routes[route];

            for (const item of parsedPath) {
                const placeIn = item.static ? it.static : it.dynamic;
                const key = item.key;

                it = placeIn[key] = placeIn[key] ?? this.createRouting();
            }

            // typescript is going crazy here
            it.self = target as unknown as Answer<Node, Element, TagOptions, Routes, Extras>;
        }
    }

    public navigate<T extends Routes>(route: T, params: RouteParameters<T>, ...args: Args) {
        this.doNavigate(composeUrl(route, params), true, ...args);
    }

    protected createRouting(): Routing<Node, Element, TagOptions, Routes, Extras> {
        return {
            dynamic: {},
            static: {},
        };
    }

    protected findTarget(
        routing: Routing<Node, Element, TagOptions, Routes, Extras>,
        path: string[],
        params: object,
    ): [Answer<Node, Element, TagOptions, Routes, Extras> | undefined, object] {
        if (path.length < 1) {
            return [routing.self, params];
        }

        const [target, ...subPath] = path;

        if (target in routing.static) {
            const match = this.findTarget(routing.static[target], subPath, params);

            if (match[0]) {
                return match;
            }
        }

        for (const key in routing.dynamic) {
            const match = this.findTarget(routing.dynamic[key], subPath, { ...params, [key]: target });

            if (match[0]) {
                return match;
            }
        }

        return [undefined, params];
    }

    protected targetByUrl(url: string) {
        const [path, query, hash] = this.parseUrl(url);
        const [target, params] = this.findTarget(
            this.root,
            path.split("/").filter(v => !!v),
            {},
        );

        return { url, path, query, hash, target, params };
    }

    protected async prepareNavigation(url: string, canNavigate: boolean, async: boolean, ...args: Args) {
        const { target, ...props } = this.targetByUrl(url);

        try {
            const accessLevel = (await this.init.getAccessLevel?.()) ?? 0;
            const minLevel = target?.minAccessLevel ?? 0;

            if (target && accessLevel >= minLevel) {
                await this.loadTarget(target, props as ScreenProps<Routes>, ...args);
            } else if (this.init.fallbackScreen) {
                await this.renderScreen(
                    this.init.fallbackScreen,
                    { cause: target ? "no-access" : "not-found" },
                    canNavigate ? "not-found" : "fallback",
                    ...args,
                );
            } else {
                throw new Error("No fallback screen");
            }
        } catch (e) {
            if (async || !this.init.errorScreen) {
                throw e;
            }

            await this.renderScreen(this.init.errorScreen, { error: e }, "error", ...args);
        }

        return;
    }

    /**
     * Must call prepareNavigation and handle promise error
     * @param url is URL to navigate to
     * @param canNavigate accept redirects when true
     * @param args extra args
     * @protected
     */
    protected abstract doNavigate(url: string, canNavigate: boolean, ...args: Args): void;

    /**
     * Parse a url to path, query param and hash
     * @param url to be parsed
     * @returns [path, query params, hash]
     * @protected
     */
    protected abstract parseUrl(url: string): [string, QueryParams, string];

    /**
     * Load (Render) a target screen
     * @param target target screen to load
     * @param props props of the target screen
     * @param args extra args
     * @protected
     */
    protected abstract loadTarget<Route extends string>(
        target: Answer<Node, Element, TagOptions, Route, Extras>,
        props: ScreenProps<Route>,
        ...args: Args
    ): Promise<void>;

    /**
     * Render a screen
     * @param screen is screen to be rendered
     * @param props are props of the screen
     * @param scope is the cause of screen rendering
     * @param args are extra args
     * @protected
     */
    protected abstract renderScreen<Props>(
        screen: (props: Props, ctx: Fragment<Node, Element, TagOptions>) => void | Promise<void>,
        props: Props,
        scope: RouteRenderScope,
        ...args: Args
    ): Promise<void>;
}
