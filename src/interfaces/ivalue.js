// @flow

export interface IValue {
    get()         : any;
    set(any)      : IValue;
    on(Function)  : IValue;
    off(Function) : IValue;
}
