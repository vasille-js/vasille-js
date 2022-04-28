import { Fragment, TagOptionsWithSlot } from "../node/node";
import { AppOptions } from "../node/app";
import { Options, TagOptions } from "./options";
import { IValue } from "../core/ivalue";
import { ListenableModel } from "../models/model";
import { AcceptedTagsMap } from "../spec/react";
export declare function app<In extends AppOptions<any>>(renderer: (opts: In) => In["return"]): (node: Element, opts: In) => In["return"];
export declare function component<In extends TagOptions<any>>(renderer: (opts: In) => In["return"]): (opts: In, callback?: In['slot']) => In["return"];
export declare function fragment<In extends Options>(renderer: (opts: In) => In["return"]): (opts: In, callback?: In['slot']) => In["return"];
export declare function extension<In extends TagOptions<any>>(renderer: (opts: In) => In["return"]): (opts: In, callback?: In['slot']) => In["return"];
export declare function tag<K extends keyof AcceptedTagsMap>(name: K, opts: TagOptionsWithSlot<K>, callback?: () => void): {
    node: (HTMLElementTagNameMap & SVGElementTagNameMap)[K];
};
declare type ExtractParams<T> = T extends ((node: Fragment, ...args: infer P) => any) ? P : never;
export declare function create<T extends Fragment>(node: T, callback?: (...args: ExtractParams<T['input']['slot']>) => void): T;
export declare const vx: {
    if(condition: IValue<boolean>, callback: () => void): void;
    else(callback: () => void): void;
    elif(condition: IValue<boolean>, callback: () => void): void;
    for<T, K>(model: ListenableModel<K, T>, callback: (value: T, index: K) => void): void;
    watch<T_1>(model: IValue<T_1>, callback: (value: T_1) => void): void;
    nextTick(callback: () => void): void;
};
export {};
