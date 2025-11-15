import { Router, WebRouterInitialization } from "./router.js";
import { DevApp, DevFragment, DevRunner, DevTagOptions, Inspector } from "vasille/dev";

export class DevRouter<Routes extends string> extends Router<Routes> {
    public readonly inspector: Inspector;

    public constructor(
        window: Window,
        location: Location,
        node: DevFragment<Node, Element, DevTagOptions>,
        init: WebRouterInitialization<Routes>,
    ) {
        super(window, location, node, init);

        this.inspector = node.inspector;
        node.inspector.registeredRoutes([...Object.keys(init.routes)]);

        this.$currentUrl.on(value => {
            node.inspector.routerStateChange("currentUrl", value);
        });
        this.$loadingUrl.on(value => {
            node.inspector.routerStateChange("loadingUrl", value);
        });
    }

    public goTo(url: string) {
        this.inspector.routerActionCall("goTo", url);
        super.goTo(url);
    }

    public ajax(url: string) {
        this.inspector.routerActionCall("ajax", url);
        super.ajax(url);
    }

    public load(url: string): Promise<void> {
        this.inspector.routerActionCall("load", url);
        return super.load(url);
    }

    public reload() {
        this.inspector.routerActionCall("reload", this.$currentUrl.V);
        super.reload();
    }

    protected targetByUrl(url: string) {
        const result =  super.targetByUrl(url);

        this.inspector.routerTargetResult({
            url: result.url,
            path: result.path,
            query: result.query,
            hash: result.hash,
            params: result.params,
            targetFound: !!result.target,
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
    const app = new DevApp(node, runner, inspector);

    app.create(new DevFragment(runner, null, null, "Root", {}, inspector), node => {
        const router = new DevRouter(window, location, node, init);

        Object.defineProperty(runner, "router", {
            value: router,
        });
    });
}