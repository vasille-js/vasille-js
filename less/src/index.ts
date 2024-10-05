import {debug, text, predefine, VxWatch, VxExtend, VxSlot, VxFor, VxPortal} from "./functional/components";
import {arrayModel, mapModel, objectModel, setModel} from "./functional/models";
import {expr, forward, mirror, point, ref, value, setValue, valueOf, watch} from "./functional/reactivity";
import {app, component, create, extension, fragment, tag, vx, reactive} from "./functional/stack";
import {TagOptions, AppOptions, FragmentOptions, PortalOptions} from "./functional/options"

import {merge} from "./functional/merge";
import {Reference, current, IValue} from "vasille";


export {
    debug,
    arrayModel,
    mapModel,
    objectModel,
    setModel,
    expr,
    forward,
    mirror,
    point,
    ref,
    value,
    setValue,
    valueOf,
    watch,
    FragmentOptions,
    TagOptions,
    PortalOptions,
    app,
    component,
    fragment,
    extension,
    text,
    tag,
    create,
    predefine,
    AppOptions,
    VxWatch,
    VxExtend,
    VxSlot,
    VxFor,
    VxPortal
}

export type VApp<In extends AppOptions<any> = AppOptions<'div'>> =
    (node: Element, opts : In) => Required<In>['return'];

export type VComponent<In extends TagOptions<any>> =
    (opts : In, callback ?: In['slot']) => Required<In>['return'];

export type VFragment<In extends FragmentOptions = FragmentOptions> =
    (opts : In, callback ?: In['slot']) => Required<In>['return'];

export type VExtension<In extends TagOptions<any>> =
    (opts : In, callback ?: In['slot']) => Required<In>['return'];

export type VReactive<In = void, Out = {}> = (renderer : (opts: In) => Out)
    => (opts: In) => Out & {destructor: () => void};

export const v = {

    ref<T> (value : T): IValue<T> {
        return current.ref(value);
    },
    expr : expr,
    of : valueOf,
    sv : setValue,

    alwaysFalse : new Reference(false),

    reactive,
    app,
    component,
    fragment,
    extension,

    text,
    tag,
    create,
    ...vx,

    merge,

    destructor() {
        return current.$destroy.bind(current);
    },
    runOnDestroy(callback : () => void) {
        current.runOnDestroy(callback);
    }
};
