// @flow
import { Reference } from "./reference.js";
import { IValue } from "../core/ivalue";



declare export class Expression<
    T, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void
> extends IValue<T> {
    values : [
        IValue<T1>,
        IValue<T2>,
        IValue<T3>,
        IValue<T4>,
        IValue<T5>,
        IValue<T6>,
        IValue<T7>,
        IValue<T8>,
        IValue<T9>
    ];
    valuesCache : [T1, T2, T3, T4, T5, T6, T7, T8, T9];
    func : (i ? : number) => void;
    linkedFunc : Array<() => void>;
    sync : Reference<T>;

    constructor (
        func : (a1 : T1) => T,
        link : boolean,
        v1: IValue<T1>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
        v4: IValue<T4>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
        v4: IValue<T4>,
        v5: IValue<T5>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
        v4: IValue<T4>,
        v5: IValue<T5>,
        v6: IValue<T6>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
        v4: IValue<T4>,
        v5: IValue<T5>,
        v6: IValue<T6>,
        v7: IValue<T7>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
        v4: IValue<T4>,
        v5: IValue<T5>,
        v6: IValue<T6>,
        v7: IValue<T7>,
        v8: IValue<T8>,
    ) : void;
    constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        link : boolean,
        v1: IValue<T1>,
        v2: IValue<T2>,
        v3: IValue<T3>,
        v4: IValue<T4>,
        v5: IValue<T5>,
        v6: IValue<T6>,
        v7: IValue<T7>,
        v8: IValue<T8>,
        v9: IValue<T9>,
    ) : void;

    get $ () : T;
    set $ (value : T) : this;
    on (handler : (value : T) => void) : this;
    off (handler : (value : T) => void) : this;
    enable () : this;
    disable () : this;
}
