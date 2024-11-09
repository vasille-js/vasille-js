import {
    App,
    ArrayModel,
    ArrayView,
    Binding,
    Destroyable,
    Expression,
    Extension,
    Fragment,
    INode,
    IValue,
    Listener,
    MapModel,
    MapView,
    Pointer,
    Reactive,
    Reference,
    SetModel,
    SetView,
    Tag,
    BaseView,
    Portal,
    Watch,
    userError,
} from "../src";
import { page } from "./page";

class BindingTest extends Binding<any> {
    protected bound(name: string): (node: INode, value: any) => void {
        return (node, value) => {
            return void 0;
        };
    }
}

it("import test", function () {
    const ref = new Reference(1);
    const point = new Pointer(ref);
    const array = new ArrayModel();
    const map = new MapModel();
    const set = new SetModel();
    const listener = new Listener();
    const baseView = new BaseView({ model: array });
    const arrayView = new ArrayView({ model: array });
    const mapView = new MapView({ model: map });
    const setView = new SetView({ model: set });
    const fragment = new Fragment({});
    const inode = new INode({});
    const tag = new Tag({}, "div");
    const ext = new Extension({});
    const app = new App(page.window.document.body, {});
    const expr = new Expression(v => v, ref);
    const binding = new BindingTest(ref);
    const portal = new Portal({ node: page.window.document.body });
    const watch = new Watch({ model: ref });

    expect(ref instanceof IValue).toBe(true);
    expect(point instanceof IValue).toBe(true);
    expect(array instanceof Array).toBe(true);
    expect(map instanceof Map).toBe(true);
    expect(set instanceof Set).toBe(true);
    expect(baseView instanceof Fragment).toBe(true);
    expect(arrayView instanceof Fragment).toBe(true);
    expect(mapView instanceof Fragment).toBe(true);
    expect(setView instanceof Fragment).toBe(true);
    expect(fragment instanceof Reactive).toBe(true);
    expect(inode instanceof Fragment).toBe(true);
    expect(tag instanceof Fragment).toBe(true);
    expect(ext instanceof Fragment).toBe(true);
    expect(app instanceof Reactive).toBe(true);
    expect(expr instanceof IValue).toBe(true);
    expect(binding instanceof Destroyable).toBe(true);
    expect(portal instanceof Fragment).toBe(true);
    expect(watch instanceof Fragment).toBe(true);
    expect(userError("msg", "e")).toBe("e");
});
