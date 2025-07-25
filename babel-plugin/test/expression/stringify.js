import { Reference } from "vasille";
import { compose } from "vasille-dx";
class Class {
  #obj = {
    prop: new Reference(2)
  };
  compose() {
    return compose(Vasille => {
      Vasille.watch(Vasille__obj_prop_$ => {
        let x = [Vasille__obj_prop_$, Vasille__obj_prop_$];
      }, this.#obj.prop);
    }, "VasilleDX:#anonymouse");
  }
}
