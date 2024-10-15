import {current, IValue, Reference} from "vasille";

export const internal = {
  /**
   * Create reference, use only in compose functions
   */
  ref(v: unknown): unknown {
    if (v instanceof IValue) {
      return v;
    }

    return current.ref(v);
  },
  /**
   * Create module reference, can be used anywhere
   */
  mRef(v: unknown): unknown {
    if (v instanceof IValue) {
      return new Reference(v.$);
    }

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
