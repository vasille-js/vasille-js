import { Reference } from "vasille";
import { Screen, Routing, RouteParameters, QueryParams, ScreenProps } from "./types.js";

export interface RouterInitilization<
    Node,
    Element,
    TagOptions extends object,
    Routes extends string,
    Extras extends object,
> {
    routes: { [K in Routes]: Screen<Node, Element, TagOptions, K, Extras> };
    getAccessLevel(): Promise<number>;
    getFallback(): Screen<Node, Element, TagOptions, "/", Extras>;
    getErrorPage(): Screen<Node, Element, TagOptions, "/:error", Extras>;
    initialUrl: string;
}

const init: RouterInitilization<unknown, unknown, object, string, object> = {
    getErrorPage() {
        return {
            answer200(ctx, props) {
                props.params.error;
            },
        };
    },
    getAccessLevel() {
        return Promise.resolve(0);
    },
    getFallback() {
        return {
            answer200(ctx, props) {
                //
            },
        };
    },
    initialUrl: "",
    routes: {},
};

export abstract class Router<Node, Element, TagOptions extends object, Routes extends string, Extras extends object, Args extends unknown[]> {
    protected root: Routing<Node, Element, TagOptions, Routes, Extras>;
    protected init: RouterInitilization<Node, Element, TagOptions, Routes, Extras>;

    public constructor(init: RouterInitilization<Node, Element, TagOptions, Routes, Extras>) {
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

                if (item.static) {
                    it = placeIn[key] = placeIn[key] ?? this.createRouting();
                }
            }

            // typescript is going crazy here
            it.self = target as unknown as Screen<Node, Element, TagOptions, Routes, Extras>;
        }
    }

    public navigate<T extends Routes>(route: T, params: RouteParameters<T>, ...args: Args) {
        this.doNavigate(Object.entries(params).reduce<string>((link, [key, value]) => {
            return link.replace(`:${key}`, value);
          }, route), true, ...args);
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
    ): [Screen<Node, Element, TagOptions, Routes, Extras> | undefined, object] {
        if (path.length < 1) {
            return [routing.self, params];
        }

        const [target, ...subPath] = path;

        if (target in routing.static) {
            const match = this.findTarget(routing.static[target], subPath, params);

            if (match) {
                return match;
            }
        }

        for (const key in routing.dynamic) {
            const match = this.findTarget(routing.dynamic[key], subPath, { ...params, [key]: target });

            if (match) {
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

        return { path, query, hash, target, params };
    }

    protected async prepareNavigation(url: string, canNavigate: boolean, ...args: Args) {
        const { target, ...props } = this.targetByUrl(url);

        try {

            if (target && (target.minAccessLevel ?? 0) >= (await this.init.getAccessLevel())) {

                await this.loadTarget(target, props as ScreenProps<Routes>, ...args);

                return;
            }

            await this.loadTarget<"/">(this.init.getFallback(), {
                path: "/",
                hash: "",
                params: {},
                query: {},
                canNavigate,
            }, ...args);
        } catch (e) {
            await this.loadTarget(this.init.getErrorPage(), {
                path: "/err",
                canNavigate: false,
                hash: "",
                query: {},
                params: {
                    error: `${e}`,
                },
            }, ...args);
        }

        return;
    }

    protected doNavigate(url: string, canNavigate: boolean, ...args: Args) {
        this.prepareNavigation(url, canNavigate, ...args).catch(e => {
            console.log(`Navigation error: ${e}`);
        });
    }

    /**
     * Parse a url to path, query param and hash
     * @param url to be parsed
     * @returns [path, query params, hash]
     */
    protected abstract parseUrl(url: string): [string, QueryParams, string];

    /**
     * Load (Render) a target screen
     * @param target target screen to load
     * @param props props of the target screen
     */
    protected abstract loadTarget<Route extends string>(
        target: Screen<Node, Element, TagOptions, Route, Extras>,
        props: ScreenProps<Route>,
        ...args: Args
    ): Promise<void>;
}
