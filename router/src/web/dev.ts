import { Router, WebRouterInitialization } from "./router.js";
import { DevApp, DevFragment, DevRunner, DevTagOptions, IDevRunner, Inspector, StaticPosition } from "vasille/dev";
import { Fragment } from "vasille";
import { ScreenProps } from "../types.js";
import { devMount } from "vasille-jsx/dev";

export function devScreen<Node, Element, TagOptions extends object, Route extends string>(
    renderer: (node: DevFragment<Node, Element, TagOptions>, input: ScreenProps<Route>) => Promise<void>,
    declaration: StaticPosition,
    name: string,
): (props: ScreenProps<Route>, ctx?: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>) => Promise<void> {
    return async function (props, node) {
        if (!node) {
            throw new Error("Vasille: Screen context is missing");
        }

        const frag = new DevFragment<Node, Element, TagOptions>(
            node.runner,
            declaration,
            null,
            name,
            props,
        );

        node.create(frag);

        await renderer(frag, props);
    };
}

export class DevRouter<Routes extends string> extends Router<Routes> {
    public readonly inspector: Inspector;

    public constructor(
        window: Window,
        location: Location,
        node: Fragment<Node, Element, DevTagOptions, IDevRunner<Node, Element, DevTagOptions>>,
        init: WebRouterInitialization<Routes>,
    ) {
        super(window, location, node, init);

        this.inspector = node.runner.inspector;
        this.inspector.registeredRoutes({paths: [...Object.keys(init.routes)],time: Date.now()});

        this.$currentUrl.on(value => {
            this.inspector.routerStateChange({name: "currentUrl", value,time: Date.now()});
        });
        this.$loadingUrl.on(value => {
            this.inspector.routerStateChange({name:"loadingUrl", value,time: Date.now()});
        });
    }

    public goTo(url: string) {
        this.inspector?.routerActionCall({name:"goTo", path: url,time: Date.now()});
        super.goTo(url);
    }

    public ajax(url: string) {
        this.inspector?.routerActionCall({name:"ajax", path:url,time: Date.now()});
        super.ajax(url);
    }

    public load(url: string): Promise<void> {
        this.inspector?.routerActionCall({name:"load", path:url,time: Date.now()});
        return super.load(url);
    }

    public reload() {
        this.inspector?.routerActionCall({name:"reload", path:this.$currentUrl.V,time: Date.now()});
        super.reload();
    }

    protected targetByUrl(url: string) {
        const result = super.targetByUrl(url);

        this.inspector?.routerTargetResult({
            url: result.url,
            path: result.path,
            query: result.query,
            hash: result.hash,
            params: result.params,
            targetFound: !!result.target,
            time: Date.now(),
        });

        return result;
    }
}

export function devRouteApp<Routes extends string>(
    node: Element,
    window: Window,
    location: Location,
    init: WebRouterInitialization<Routes>,
    inspector: Inspector,
) {
    const runner = new DevRunner(window.document, inspector);

    return devMount<object>(
        node,
        (_data, node) => {
            const router = new DevRouter(window, location, node, init);

            Object.defineProperty(runner, "router", {
                value: router,
            });
        },
        runner,
        {},
        inspector,
    );
}
