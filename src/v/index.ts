import {debug, text} from "../functional/components";
import {arrayModel, mapModel, objectModel, setModel} from "../functional/models";
import {expr, forward, mirror, point, ref, setValue, valueOf, watch} from "../functional/reactivity";
import {app, component, create, extension, fragment, tag, vx} from "../functional/stack";
import { Options, TagOptions } from "../functional/options";
import {AppOptions} from "../node/app";

import {current} from "../core/core";
import {Reference} from "../value/reference";
import {merge} from "../functional/merge";


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
    setValue,
    valueOf,
    watch,
    Options,
    TagOptions,
    AppOptions
}

export const v = {

    ref (value : any) {
        return current.ref(value);
    },
    expr : expr,
    of : valueOf,
    sv : setValue,

    alwaysFalse : new Reference(false),

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
        return current.destroy.bind(current);
    },
    runOnDestroy(callback : () => void) {
        current.runOnDestroy(callback);
    }
};
