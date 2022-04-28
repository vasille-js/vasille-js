import { IValue } from "../core/ivalue";
import { Pointer } from "../value/pointer";
import { KindOfIValue } from "../value/expression";
export declare function ref<T>(value: T): [IValue<T>, (value: T) => void];
export declare function mirror<T>(value: IValue<T>): import("../index").Mirror<T>;
export declare function forward<T>(value: IValue<T>): import("../index").Mirror<T>;
export declare function point<T>(value: IValue<T>): Pointer<T>;
export declare function expr<T, Args extends unknown[]>(func: (...args: Args) => T, ...values: KindOfIValue<Args>): IValue<T>;
export declare function watch<Args extends unknown[]>(func: (...args: Args) => void, ...values: KindOfIValue<Args>): void;
export declare function valueOf<T>(value: IValue<T>): T;
export declare function setValue<T>(ref: IValue<T>, value: IValue<T> | T): void;
