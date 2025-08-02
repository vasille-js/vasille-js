import { setErrorHandler } from "vasille";
import { routeApp, Router, WebRouterInitialization } from "../src/web/router.js";
import { page } from "./page.js";
import { jest } from "@jest/globals";

it("empty", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen(ctx, props) {
            ctx.tag("div", { class: ["fallback"] }, div => {
                div.text(props.cause);
            });
        },
        errorScreen() {},
        routes: {},
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("fallback");
        expect(body.children[0].innerHTML).toBe("not-found");
        done();
    }, 1);
});

it("error", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen: () => {
            throw new Error("test error");
        },
        errorScreen(ctx, props) {
            ctx.tag("div", { class: ["error"] }, div => {
                div.text(props.error);
            });
        },
        routes: {},
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("error");
        expect(body.children[0].innerHTML).toBe("Error: test error");
        done();
    }, 1);
});

it("report error", function (done) {
    const window = page();
    const body = window.document.body;

    const reportError = jest.fn().mockImplementation((e: unknown) => {
        expect(`${e}`).toBe("Error: double error");
    });

    setErrorHandler(reportError);

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen() {
            throw new Error("test error");
        },
        errorScreen() {
            throw new Error("double error");
        },
        routes: {},
    });

    setTimeout(() => {
        expect(body.children.length).toBe(0);
        expect(reportError).toHaveBeenCalled();
        done();
    }, 1);
});

it("report invalid URL error", function (done) {
    const window = page("about:blank");
    const body = window.document.body;

    const reportError = jest.fn().mockImplementation((e: unknown) => {
        expect(`${e}`).toBe("TypeError [ERR_INVALID_URL]: Invalid URL");
    });

    setErrorHandler(reportError);

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen() {},
        errorScreen() {},
        routes: {},
    });

    setTimeout(() => {
        expect(reportError).toHaveBeenCalled();
        done();
    }, 1);
});

function createLocation(path: string): Location {
    return {
        pathname: path,
        href: `http://localhost:8080${path}`,
        origin: "http://localhost:8080",
    } as unknown as Location;
}

it("static /", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, createLocation("/?text=queryText"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/": {
                screen(ctx, props) {
                    expect(props.path).toBe("/");
                    ctx.tag("div", { class: ["answer200"] }, div => {
                        div.text(props.query.text);
                    });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("answer200");
        expect(body.children[0].innerHTML).toBe("queryText");
        done();
    }, 1);
});

it("static /about", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, createLocation("/about?text=1&text=2"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/about": {
                screen(ctx, props) {
                    expect(props.path).toBe("/about");
                    ctx.tag("div", { class: ["answer301"] }, div => {
                        div.text(Array.isArray(props.query.text) && props.query.text.join(","));
                    });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("answer301");
        expect(body.children[0].innerHTML).toBe("1,2");
        done();
    }, 1);
});

it("static /error/404", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, createLocation("/error/404#hash"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/error/404": {
                screen(ctx, props) {
                    expect(props.path).toBe("/error/404");
                    ctx.tag("div", { class: ["answer404"] }, div => {
                        div.text(props.hash);
                    });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("answer404");
        expect(body.children[0].innerHTML).toBe("#hash");
        done();
    }, 1);
});

it("dynamic /:test", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, createLocation("/test-value"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/:test": {
                screen(ctx, props) {
                    expect(props.path).toBe("/test-value");
                    ctx.tag("div", { class: [props.params.test] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("test-value");
        done();
    }, 1);
});

it("dynamic /path/:value", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, createLocation("/path/c23"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/path/:value": {
                screen(ctx, props) {
                    expect(props.path).toBe("/path/c23");
                    ctx.tag("div", { class: [props.params.value] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("c23");
        done();
    }, 1);
});

it("dynamic /before/:value/after", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, createLocation("/before/vx/after"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/before/:value/after": {
                screen(ctx, props) {
                    expect(props.path).toBe("/before/vx/after");
                    ctx.tag("div", { class: [props.params.value] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("vx");
        done();
    }, 1);
});

it("dynamic /:v /1/:v /:v/2/3 /1/2/:v/4", function (done) {
    function doTest(path: string) {
        const window = page();
        const body = window.document.body;

        const init: WebRouterInitialization<"/:v" | "/1/:v" | "/:v/2/3" | "/1/2/:v/4"> = {
            fallbackScreen() {},
            errorScreen() {},
            routes: {
                "/:v": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`c_${props.params.v}`] });
                    },
                },
                "/1/:v": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`c_1_${props.params.v}`] });
                    },
                },
                "/:v/2/3": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`c_${props.params.v}_2_3`] });
                    },
                },
                "/1/2/:v/4": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`c_1_2_${props.params.v}_4`] });
                    },
                },
            },
        };

        routeApp(body, window as unknown as Window, createLocation(path), init);

        return body;
    }

    const body1 = doTest("/1");
    const body2 = doTest("/1/2");
    const body3 = doTest("/1/2/3");
    const body4 = doTest("/1/2/3/4");

    setTimeout(() => {
        expect(body1.children.length).toBe(1);
        expect(body1.children[0].className).toBe("c_1");
        expect(body2.children.length).toBe(1);
        expect(body2.children[0].className).toBe("c_1_2");
        expect(body3.children.length).toBe(1);
        expect(body3.children[0].className).toBe("c_1_2_3");
        expect(body4.children.length).toBe(1);
        expect(body4.children[0].className).toBe("c_1_2_3_4");
        done();
    }, 1);
});

it("dynamic vs static /1 /:v /1/2 /1/:v", function (done) {
    function doTest(path: string) {
        const window = page();
        const body = window.document.body;

        const init: WebRouterInitialization<"/:v" | "/1" | "/1/2" | "/1/:v"> = {
            fallbackScreen() {},
            errorScreen() {},
            routes: {
                "/:v": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`d_${props.params.v}`] });
                    },
                },
                "/1": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`s_1`] });
                    },
                },
                "/1/:v": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`d_1_${props.params.v}`] });
                    },
                },
                "/1/2": {
                    screen(ctx, props) {
                        ctx.tag("div", { class: [`s_1_2`] });
                    },
                },
            },
        };

        routeApp(body, window as unknown as Window, createLocation(path), init);

        return body;
    }

    const body1 = doTest("/1");
    const body2 = doTest("/3");
    const body3 = doTest("/1/2");
    const body4 = doTest("/1/3");

    setTimeout(() => {
        expect(body1.children.length).toBe(1);
        expect(body1.children[0].className).toBe("s_1");
        expect(body2.children.length).toBe(1);
        expect(body2.children[0].className).toBe("d_3");
        expect(body3.children.length).toBe(1);
        expect(body3.children[0].className).toBe("s_1_2");
        expect(body4.children.length).toBe(1);
        expect(body4.children[0].className).toBe("d_1_3");
        done();
    }, 1);
});

it("switch page: found -> found", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;

    routeApp(body, window as unknown as Window, createLocation("/about"), {
        fallbackScreen() {},
        errorScreen() {},
        routes: {
            "/about": {
                screen(ctx) {
                    ctx.tag("div", { class: [`about`] });
                    expect("router" in ctx.runner).toBe(true);
                    if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                        router = ctx.runner.router;
                    }
                },
            },
            "/article/:id": {
                screen(ctx, props) {
                    ctx.tag("div", { class: [`article_${props.params.id}`] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("about");
        router.silentNavigate("/article/:id", { id: "23" }).then(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("article_23");
            done();
        });
    }, 1);
});

it("switch page: found -> fallback", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;

    routeApp(body, window as unknown as Window, createLocation("/found"), {
        fallbackScreen(ctx) {
            ctx.tag("div", { class: [`fallback`] });
        },
        errorScreen() {},
        routes: {
            "/found": {
                screen(ctx) {
                    ctx.tag("div", { class: [`found`] });
                    if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                        router = ctx.runner.router;
                    }
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("found");
        router.navigate("/missing", {}, "silent");
        setTimeout(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("fallback");
            done();
        }, 1);
    }, 1);
});

it("switch page: fallback -> error", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;

    routeApp(body, window as unknown as Window, createLocation("/"), {
        fallbackScreen(ctx) {
            ctx.tag("div", { class: [`fallback`] });
            if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                router = ctx.runner.router;
            }
        },
        errorScreen() {},
        routes: {
            "/error": {
                screen() {
                    throw new Error("catch me");
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("fallback");
        expect(router.silentNavigate("/error", {})).rejects.toThrow("catch me").finally(done);
    }, 1);
});

it("switch page: error -> found", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;

    routeApp(body, window as unknown as Window, createLocation("/missing"), {
        fallbackScreen() {
            throw new Error("error");
        },
        errorScreen(ctx) {
            ctx.tag("div", { class: [`error`] });
            if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                router = ctx.runner.router;
            }
        },
        routes: {
            "/exists": {
                screen(ctx) {
                    ctx.tag("div", { class: [`exists`] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("error");
        router.silentNavigate("/exists", {}).then(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("exists");
            done();
        });
    }, 1);
});

it("no access fallback", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;
    let accessLevel = 0;

    routeApp(body, window as unknown as Window, createLocation("/exists"), {
        getAccessLevel(): Promise<number> {
            return Promise.resolve(accessLevel);
        },
        fallbackScreen(ctx, props) {
            ctx.tag("div", { class: [props.cause] });
            if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                router = ctx.runner.router;
            }
        },
        errorScreen() {},
        routes: {
            "/exists": {
                screen(ctx) {
                    ctx.tag("div", { class: [`exists`] });
                },
                minAccessLevel: 1,
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("no-access");
        accessLevel = 2;
        router.reload();
        setTimeout(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("exists");
            done();
        }, 1);
    }, 1);
});

it("window popstate event", function (done) {
    const window = page();
    const body = window.document.body;
    const location = createLocation("/init");

    routeApp(body, window as unknown as Window, location, {
        fallbackScreen(ctx, props) {
            ctx.tag("div", { class: ["fallback"] });
        },
        errorScreen() {},
        routes: {
            "/exists": {
                screen(ctx) {
                    ctx.tag("div", { class: [`exists`] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("fallback");
        location.href = "http://localhost:8080/exists";
        window.dispatchEvent(new window.PopStateEvent("popstate"));
        setTimeout(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("exists");
            location.href = "http://localhost:8080/dont-exists";
            window.dispatchEvent(new window.PopStateEvent("popstate"));
            setTimeout(() => {
                expect(body.children.length).toBe(1);
                expect(body.children[0].className).toBe("fallback");
                // window.location will be the initial one (from page.ts)
                // because location.href always match the required url, no pushes are done
                // window.location IS NOT location (we update the second one)
                expect(window.location.href).toBe("http://localhost:8080/");
                done();
            });
        }, 1);
    }, 1);
});

it("loading screen: before first screen", function (done) {
    const window = page();
    const body = window.document.body;
    let resolve: ((v: unknown) => void) | null = null;

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen() {},
        errorScreen() {},
        loadingScreen(node) {
            node.tag("div", { class: ["loading"] });
        },
        routes: {
            "/": {
                async screen(ctx) {
                    await new Promise(rv => (resolve = rv));
                    ctx.tag("div", { class: ["content"] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("loading");
        resolve?.(1);
        setTimeout(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("content");
            done();
        }, 1);
    }, 1);
});

it("loading screen: between screens", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;
    let resolve: ((v: unknown) => void) | null = null;

    routeApp(body, window as unknown as Window, createLocation("/"), {
        fallbackScreen() {},
        errorScreen() {},
        loadingScreen(node) {
            node.tag("div", { class: ["loading"] });
        },
        routes: {
            "/": {
                screen(ctx) {
                    ctx.tag("div", { class: [`first`] });
                    if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                        router = ctx.runner.router;
                    }
                },
            },
            "/wait": {
                async screen(ctx) {
                    await new Promise(rv => (resolve = rv));
                    ctx.tag("div", { class: ["second"] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("first");
        resolve?.(1);
        expect(router.loadingUrl.$).toBeNull();
        expect(router.currentUrl.$).toBe("http://localhost:8080/");
        router.navigate("/wait", {}, "loading-screen");
        setTimeout(() => {
            expect(body.children.length).toBe(1);
            expect(body.children[0].className).toBe("loading");
            expect(router.loadingUrl.$).toBe("/wait");
            resolve?.(2);
            setTimeout(() => {
                expect(body.children.length).toBe(1);
                expect(body.children[0].className).toBe("second");
                expect(router.loadingUrl.$).toBeNull();
                expect(router.currentUrl.$).toBe("/wait");
                done();
            }, 1);
        }, 1);
    }, 1);
});

it("loading overlay", function (done) {
    const window = page();
    const body = window.document.body;
    let router!: Router<string>;
    let resolve: ((v: unknown) => void) | null = null;

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen(ctx) {
            ctx.tag("div", { class: [`fallback`] });
            if ("router" in ctx.runner && ctx.runner.router instanceof Router) {
                router = ctx.runner.router;
            }
        },
        errorScreen() {},
        loadingOverlay(node) {
            node.tag("div", { class: ["overlay"] });
        },
        routes: {
            "/content": {
                async screen(ctx) {
                    await new Promise(rv => (resolve = rv));
                    ctx.tag("div", { class: ["content"] });
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("fallback");
        resolve?.(1);
        router.navigate("/content", {}, "loading-overlay");
        setTimeout(() => {
            expect(body.children.length).toBe(2);
            expect(body.children[1].className).toBe("overlay");
            resolve?.(2);
            setTimeout(() => {
                expect(body.children.length).toBe(1);
                expect(body.children[0].className).toBe("content");
                done();
            }, 1);
        }, 1);
    }, 1);
});

it("throw error in component", function (done) {
    const window = page();
    const body = window.document.body;

    routeApp(body, window as unknown as Window, window.location, {
        fallbackScreen() {},
        errorScreen(ctx, props) {
            ctx.tag("div", { class: ["error"] }, div => {
                div.text(props.error);
            });
        },
        routes: {
            "/": {
                async screen(ctx) {
                    throw new Error("test error");
                },
            },
        },
    });

    setTimeout(() => {
        expect(body.children.length).toBe(1);
        expect(body.children[0].className).toBe("error");
        expect(body.children[0].innerHTML).toBe("Error: test error");
        done();
    }, 1);
});
