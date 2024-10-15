import {current, IValue, Reference} from "vasille";

export const internal = {
  /**
   * Create reference, use only in compose functions
   */
  ref<T>(v: T): IValue<T> {
    return current.ref(v);
  },
  /**
   * Create module reference, can be used anywhere
   */
  mRef<T>(v:T): IValue<T> {
    return new Reference(v);
  },
  /**
   * Create expression
   * @param func
   * @param values
   */
  expr<T, Args extends unknown[]>(func : (...args : Args) => T, ...values: Args): IValue<any> {
    //
  }
}
