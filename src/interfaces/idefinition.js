// @flow

import {ComponentCore} from "./core";
import type {IValue} from "./ivalue";
import type {IBind} from "./ibind";



export type Callable = (rt : ComponentCore, ts : ComponentCore) => any;

export interface IDefinition {
    create(rt : ComponentCore, ts : ComponentCore) : IValue | IBind;
}
