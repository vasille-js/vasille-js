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
import {AcceptedTagsMap} from "../spec/react";

export function app<In extends Options>(renderer: (opts : In) => In["return"])
    : (node: Element, opts : In) => void {
    return (node, opts) => {
        new App(node).runFunctional(renderer, opts);
    }
}

export function component<In extends TagOptions<any>>
    (renderer: (opts : In) => In["return"])
    : (opts : In, callback : In['slot']) => In["return"] {
    return (opts, callback ?: In['slot']) => {
        const component = new Component(opts);
        if (!(current instanceof Fragment)) throw 'missing parent node';

        if (callback) opts.slot = callback;
        current.create(component);

        return component.runFunctional(renderer, opts);
    }
}

export function fragment<In extends Options>
    (renderer: (opts : In) => In["return"]) : (opts : In, callback : In['slot']) => In["return"] {
    return (opts, callback : In['slot']) => {
        const frag = new Fragment(opts);
        if (!(current instanceof Fragment)) throw 'missing parent node';

        if (callback) opts.slot = callback;
        current.create(frag);

        return frag.runFunctional(renderer, opts);
    }
}

export function extension<In extends TagOptions<any>>
(renderer: (opts : In) => In["return"]) : (opts : In, callback : In['slot']) => In["return"] {
    return (opts, callback ?: In['slot']) => {
        const ext = new Extension(opts);
        if (!(current instanceof Fragment)) throw 'missing parent node';

        if (callback) opts.slot = callback;
        current.create(ext);

        return ext.runFunctional(renderer, opts);
    }
}

export function tag<K extends keyof AcceptedTagsMap>(
    name : string,
    opts : TagOptionsWithSlot<K>,
    callback : () => void
) : { node : (HTMLElementTagNameMap & SVGElementTagNameMap)[K] } {
    if (!(current instanceof Fragment)) throw 'missing current node';

    return {
        node : current.tag(name, opts, (node: Fragment) => {
            node.runFunctional(callback);
        }) as (HTMLElementTagNameMap & SVGElementTagNameMap)[K]
    };
}

type ExtractParams<T> = T extends ((node : Fragment, ...args: infer P) => any) ? P : never

export function create<T extends Fragment>(
    node : T,
    callback ?: (...args: ExtractParams<T['input']['slot']>) => void
) : T {
    if (!(current instanceof Fragment)) throw 'missing current node';

    current.create(node, (node : Fragment, ...args : ExtractParams<T['input']['slot']>) => {
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
            create(new ArrayView<T>({ model }), callback as any as (value : T, index : T) => void);
        }
        else if (model instanceof MapModel) {
            create(new MapView<K, T>({ model }), callback);
        }
        else if (model instanceof SetModel) {
            // for sets T & K are the same type
            create(new SetView<T>({ model }), callback as any as (value : T, index : T) => void);
        }
        else if (model instanceof ObjectModel) {
            // for objects K is always string
            create(new ObjectView<T>({ model }), callback as any as (value : T, index : string) => void);
        }
        else {
            throw "wrong use of `v.for` function";
        }
    },
    watch<T>(model: IValue<T>, callback: (value : T) => void) {
        const opts = {model};
        create(new Watch<T>(opts), callback);
    },
    nextTick(callback: () => void) {
        const node = current;
        window.setTimeout(() => {
            node.runFunctional(callback);
        }, 0);
    }
}
