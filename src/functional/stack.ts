import {Component, Extension, Fragment, SwitchedNode, TagOptionsWithSlot} from "../node/node";
import { App } from "../node/app";
import { current, Reactive } from "../core/core";
import { Options, TagOptions } from "./options";
import { IValue } from "../core/ivalue";
import { ListenableModel } from "../models/model";
import { ArrayModel } from "../models/array-model";
import { ArrayView } from "../views/array-view";
import { MapModel } from "../models/map-model";
import { MapView } from "../views/map-view";
import { SetModel } from "../models/set-model";
import { SetView } from "../views/set-view";
import { ObjectModel } from "../models/object-model";
import { ObjectView } from "../views/object-view";
import { Watch } from "../node/watch";

export function app<In extends Options, Out = void>(renderer: (opts : In) => Out, destroyed ?: (o : Out) => Out)
    : (node: Element, opts : In) => void {
    return (node, opts) => {
        const app = new App(node);
        const out = app.runFunctional(renderer, opts);

        destroyed && app.runOnDestroy(() => destroyed(out));
    }
}

type HasElement = { node: Element };

export function component<In extends TagOptions, Out = void>
    (renderer: (opts : In) => Out, destroyed ?: (o : Out) => void)
    : (opts : In, callback : In['slot']) => Out & HasElement {
    return (opts, callback ?: In['slot']) => {
        const component = new Component();
        if (!(current instanceof Fragment)) throw 'missing parent node';

        if (callback) opts.slot = callback;
        current.create(component, opts);
        const out = {
            ...component.runFunctional(renderer, opts),
            node: component.node
        };
        destroyed && component.runOnDestroy(() => destroyed(out));

        return out;
    }
}

export function fragment<In extends Options, Out = void>
    (renderer: (opts : In) => Out, destroyed ?: (o : Out) => void) : (opts : In, callback : In['slot']) => Out {
    return (opts, callback : In['slot']) => {
        const frag = new Fragment;
        if (!(current instanceof Fragment)) throw 'missing parent node';

        if (callback) opts.slot = callback;
        current.create(frag, opts);
        const out = frag.runFunctional(renderer, opts);
        destroyed && frag.runOnDestroy(() => destroyed(out));

        return out;
    }
}

export function extension<In extends TagOptions, Out = void>
(renderer: (opts : In) => Out, destroyed ?: (o : Out) => void) : (opts : In, callback : In['slot']) => Out {
    return (opts, callback ?: In['slot']) => {
        const ext = new Extension();
        if (!(current instanceof Fragment)) throw 'missing parent node';

        if (callback) opts.slot = callback;
        current.create(ext, opts);
        const out = ext.runFunctional(renderer, opts);
        destroyed && ext.runOnDestroy(() => destroyed(out));

        return out;
    }
}

export function reactive<In, Out>(renderer: (opts : In) => Out, destroyed ?: (o : Out) => void) : (opts : In) => Out {
    return opts => {
        const obj = new Reactive();
        current.autodestroy(obj);

        const out = obj.runFunctional(renderer, opts);
        destroyed && obj.runOnDestroy(() => destroyed(out));

        return out;
    }
}

export function tag<K extends keyof HTMLElementTagNameMap>(
    name : K,
    opts : TagOptionsWithSlot<HTMLElementTagNameMap[K]>,
    callback ?: (element : HTMLElementTagNameMap[K]) => void
) : HTMLElementTagNameMap[K]
export function tag<K extends keyof SVGElementTagNameMap>(
    name : K,
    opts : TagOptionsWithSlot<SVGElementTagNameMap[K]>,
    callback ?: (element : SVGElementTagNameMap[K]) => void
) : SVGElementTagNameMap[K]
export function tag(
    name : string,
    opts : TagOptionsWithSlot<Element>,
    callback ?: (element : Element) => void
) : Element
export function tag<T extends Element>(
    name : string,
    opts : TagOptionsWithSlot<T>,
    callback ?: (element : T) => void
) : T {
    if (!(current instanceof Fragment)) throw 'missing current node';

    return current.tag(name, opts,(node: Fragment, element : T) => {
        node.runFunctional(callback, element);
    }) as T;
}

type ExtractParams<T> = T extends ((node : Fragment, ...args: infer P) => any) ? P : never

export function create<T extends Fragment>(
    node : T,
    input : T['input'],
    callback ?: (...args: ExtractParams<T['input']['slot']>) => void
) : T {
    if (!(current instanceof Fragment)) throw 'missing current node';

    current.create(node, input, (node : Fragment, ...args : ExtractParams<T['input']['slot']>) => {
        node.runFunctional(callback, ...args);
    });

    return node;
}



export const v = {
    if(condition: IValue<boolean>, callback: () => void) {
        if (current instanceof Fragment) {
            current.if(condition, node => node.runFunctional(callback));
        }
        else {
            throw "wrong use of `v.if` function";
        }
    },
    else(callback: () => void) {
        if (current instanceof Fragment) {
            current.else(node => node.runFunctional(callback));
        }
        else {
            throw "wrong use of `v.else` function";
        }
    },
    elif(condition: IValue<boolean>, callback: () => void) {
        if (current instanceof Fragment) {
            current.elif(condition, node => node.runFunctional(callback));
        }
        else {
            throw "wrong use of `v.elif` function";
        }
    },
    for<T, K>(model : ListenableModel<K, T>, callback : (value : T, index : K) => void) {
        if (model instanceof ArrayModel) {
            // for arrays T & K are the same type
            create(new ArrayView<T>(), { model }, callback as any as (value : T, index : T) => void);
        }
        else if (model instanceof MapModel) {
            create(new MapView<K, T>(), { model }, callback);
        }
        else if (model instanceof SetModel) {
            // for sets T & K are the same type
            create(new SetView<T>(), { model }, callback as any as (value : T, index : T) => void);
        }
        else if (model instanceof ObjectModel) {
            // for objects K is always string
            create(new ObjectView<T>(), { model }, callback as any as (value : T, index : string) => void);
        }
        else {
            throw "wrong use of `v.for` function";
        }
    },
    watch<T>(model: IValue<T>, callback: (value : T) => void) {
        create(new Watch<T>(), { model }, callback);
    },
    nextTick(callback: () => void) {
        const node = current;
        window.setTimeout(() => {
            node.runFunctional(callback);
        }, 0);
    }
}
