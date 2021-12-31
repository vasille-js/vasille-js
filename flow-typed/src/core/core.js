// @flow
import { Destroyable } from "./destroyable.js";
import { IValue } from "./ivalue.js";
import { Expression } from "../value/expression";
import { Pointer } from "../value/pointer";



declare export class ReactivePrivate extends Destroyable {
    watch : Set<IValue<any>>;
    bindings : Set<Destroyable>;
    enabled : boolean;
    frozen : boolean;
    freezeExpr : Expression<void, boolean>;

    constructor () : void;

    $destroy () : void;
}

declare export class Reactive extends Destroyable {
    $ : ReactivePrivate;

    constructor ($ : ?ReactivePrivate) : void;

    $ref<T> (value : T) : IValue<T>;
    $pointer<T> (value : T) : Pointer<T>;

    $watch<T1> (
        func : (a1 : T1) => void,
        v1: IValue<T1>,
    ) : void;
    $watch<T1, T2> (
        func : (a1 : T1, a2 : T2) => void,
        v1: IValue<T1>, v2: IValue<T2>,
    ) : void;
    $watch<T1, T2, T3> (
        func : (a1 : T1, a2 : T2, a3 : T3) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
    ) : void;
    $watch<T1, T2, T3, T4> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>,
    ) : void;
    $watch<T1, T2, T3, T4, T5> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>,
    ) : void;
    $watch<T1, T2, T3, T4, T5, T6> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
    ) : void;
    $watch<T1, T2, T3, T4, T5, T6, T7> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        v7: IValue<T7>,
    ) : void;
    $watch<T1, T2, T3, T4, T5, T6, T7, T8> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        v7: IValue<T7>, v8: IValue<T8>,
    ) : void;
    $watch<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>,
    ) : void;

    $bind<T, T1> (
        func : (a1 : T1) => T,
        v1: IValue<T1>,
    ) : void;
    $bind<T, T1, T2> (
        func : (a1 : T1, a2 : T2) => T,
        v1: IValue<T1>, v2: IValue<T2>,
    ) : void;
    $bind<T, T1, T2, T3> (
        func : (a1 : T1, a2 : T2, a3 : T3) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
    ) : void;
    $bind<T, T1, T2, T3, T4> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>,
    ) : void;
    $bind<T, T1, T2, T3, T4, T5> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>,
    ) : void;
    $bind<T, T1, T2, T3, T4, T5, T6> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
    ) : void;
    $bind<T, T1, T2, T3, T4, T5, T6, T7> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        v7: IValue<T7>,
    ) : void;
    $bind<T, T1, T2, T3, T4, T5, T6, T7, T8> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        v7: IValue<T7>, v8: IValue<T8>,
    ) : void;
    $bind<T, T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>,
        v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>,
        v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>,
    ) : void;

    $enable () : void;
    $disable () : void;
    $bindFreeze (cond : IValue<boolean>, onOff : ?Function, onOn : ?Function) : this;
    $destroy () : void;
}
