import {AcceptedTagsMap, current, Extension, Fragment, IValue, ListenableModel, Portal, TagOptions, userError} from "vasille";
import {vx} from "./stack";
import {PortalOptions} from "./options";
import {v} from "../index";


export function text(text : string | IValue<string>) {
    if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');
    current.text(text);
}

export function debug(text : IValue<string>) {
    if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');
    current.debug(text);
}

export function predefine<T extends (...args: any) => any>(slot : T | null | undefined, predefined : T) : T {
    return slot || predefined;
}

export function VxWatch<T>(options: { model: IValue<T>, slot?: (value : T) => void }) : void {
    options.slot && vx.watch(options.model, options.slot);
}

export function VxExtend<K extends keyof AcceptedTagsMap>(options: { model: K } & TagOptions<K>) : void {
    if (current instanceof Extension) {
        current.extend(options);
    }
}

export function VxSlot<T extends object = Record<string, unknown>>
    (options: { model: (() => any) | ((input : T) => any), slot?: () => any} & T) : void {
    options.model
        ? options.model(options)
        : options.slot && options.slot();
}

export function VxFor<T, K>
    (options: {model : ListenableModel<K, T>, slot ?: (value : T, index : K) => void}) : void {
    options.slot && vx.for(options.model, options.slot);
}

export function VxPortal(options: PortalOptions) : void {
    const slot = options.slot;
    options.slot = undefined;
    v.create(new Portal(options), slot);
}
