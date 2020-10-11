// @flow

import {Core} from "./core";
import type {IValue} from "./ivalue";
import type {IBind} from "./ibind";



export type Callable = Function;

export interface IDefinition {
    create(rt : Core, ts : Core) : IValue | IBind;
}

export interface Instantiable {
    get lastInstance () : Core;
}
