import {
    App,
    AppNode,
    ArrayModel, ArrayView, Binding, Component,
    Destroyable, Expression, Extension, Fragment, INode,
    IValue, Listener,
    MapModel, MapView,
    Mirror,
    ObjectModel, ObjectView,
    Pointer, Reactive,
    Reference,
    SetModel, SetView, Tag,
    BaseView
} from "../src";
import {page} from "./page";

class BindingTest extends Binding<any> {
    protected bound(name: string): (node: INode, value: any) => void {
        return (node, value) => {
            return void 0;
        }
    }
}

it('import test', function () {
    const destroyable = new Destroyable();
    const ivalue = new IValue(false);
    const ref = new Reference(ivalue);
    const mirror = new Mirror(ref);
    const point = new Pointer(mirror);
    const array = new ArrayModel();
    const map = new MapModel();
    const obj = new ObjectModel();
    const set = new SetModel();
    const listener = new Listener();
    const baseView = new BaseView({ model: array });
    const arrayView = new ArrayView({ model: array });
    const mapView = new MapView({ model: map });
    const objectView = new ObjectView({ model: obj });
    const setView = new SetView({ model: set });
    const fragment = new Fragment({});
    const inode = new INode({});
    const tag = new Tag({});
    const component = new Component({});
    const ext = new Extension({});
    const appNode = new AppNode({});
    const app = new App(page.window.document.body, {});
    const expr = new Expression(v => v, false, ref);
    const binding = new BindingTest(ref);
    const reactive = new Reactive({});
});
