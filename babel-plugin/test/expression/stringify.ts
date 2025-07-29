import { Reference } from "vasille";
import { compose, watch } from "vasille-web";

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
