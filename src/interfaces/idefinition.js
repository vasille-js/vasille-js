// @flow

import {ComponentCore} from "./core";
import type {IValue} from "./ivalue";
import type {IBind} from "./ibind";



export type Callable = Function;

export interface IDefinition {
    create(rt : ComponentCore, ts : ComponentCore) : IValue | IBind;
}

export interface Instantiable {
    get lastInstance () : ComponentCore;
}
