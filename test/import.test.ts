import {
    App,
    AppNode,
    ArrayModel, ArrayView, BaseView, Binding, Component,
    Destroyable, Executor, Expression, Extension, Fragment, INode, InstantExecutor, Interceptor, InterceptorNode,
    IValue, Listener,
    MapModel, MapView,
    Mirror,
    ObjectModel, ObjectView,
    Pointer, Reactive,
    Reference, Repeater,
    RepeatNode,
    SetModel, SetView, Signal, Slot, Tag, TimeoutExecutor
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
    const repeatNode = new RepeatNode();
    const repeater = new Repeater();
    const baseView = new BaseView();
    const listener = new Listener();
    const arrayView = new ArrayView(array);
    const mapView = new MapView(map);
    const objectView = new ObjectView(obj);
    const setView = new SetView(set);
    const fragment = new Fragment();
    const inode = new INode();
    const tag = new Tag();
    const component = new Component();
    const ext = new Extension();
    const appNode = new AppNode();
    const app = new App(page.window.document.body);
    const executor = new Executor();
    const iExecutor = new InstantExecutor();
    const tExecutor = new TimeoutExecutor();
    const signal = new Signal();
    const slot = new Slot();
    const interceptor = new Interceptor();
    const interceptorNode = new InterceptorNode();
    const expr = new Expression(v => v, false, ref);
    const binding = new BindingTest(inode, '', ref);
    const reactive = new Reactive();
});
