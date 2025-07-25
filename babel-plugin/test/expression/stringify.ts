import { Reference } from "vasille";
import { calculate, compose, watch } from "vasille-dx";

class Class {
  #obj = {
    prop: new Reference(2),
  };

  compose() {
    return compose(() => {
      watch(() => {
        let x = [this.#obj.prop.$, this.#obj["prop"].$];
      });
    });
  }
}
