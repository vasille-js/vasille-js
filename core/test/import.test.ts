import {
    App,
    ArrayModel,
    ArrayView,
    Expression,
    Fragment,
    IValue,
    Listener,
    MapModel,
    MapView,
    Reactive,
    Reference,
    SetModel,
    SetView,
    Portal,
    Watch,
    userError,
    Destroyable,
    Tag,
    TextNode,
} from "../src/index.js";
import { Runner, TagOptions } from "../src/runner/web/runner.js";
import { page } from "./page.js";

it("import test", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const ref = new Reference(1);
    const array = new ArrayModel();
    const map = new MapModel();
    const set = new SetModel();
    const listener = new Listener();
    const arrayView = new ArrayView(
        runner,
        0,
        array,
        () => void 0,
        v => new Reference(v),
        runner => new Fragment(runner, 1),
    );
    const mapView = new MapView(
        runner,
        0,
        map,
        () => {},
        v => new Reference(v),
        runner => new Fragment(runner, 1),
    );
    const setView = new SetView(
        runner,
        0,
        set,
        () => {},
        runner => new Fragment(runner, 1),
    );
    const fragment = new Fragment(runner, 1);
    const app = new App<Node, Element, TagOptions>(window.document.body, runner);
    const expr = new Expression(
        v => v,
        v => new Reference(v[0]),
        [ref],
    );
    const portal = new Portal<Node, Element, TagOptions>({ node: window.document.body }, runner, 1);
    const watch = new Watch({ model: ref }, runner, 1);

    expect(ref instanceof IValue).toBe(true);
    expect(array instanceof Array).toBe(true);
    expect(map instanceof Map).toBe(true);
    expect(set instanceof Set).toBe(true);
    expect(arrayView instanceof Fragment).toBe(true);
    expect(mapView instanceof Fragment).toBe(true);
    expect(setView instanceof Fragment).toBe(true);
    expect(fragment instanceof Reactive).toBe(true);
    expect(app instanceof Reactive).toBe(true);
    expect(expr instanceof IValue).toBe(true);
    expect(portal instanceof Fragment).toBe(true);
    expect(watch instanceof Fragment).toBe(true);
    expect(userError("msg", "e")).toBe("e");
});
