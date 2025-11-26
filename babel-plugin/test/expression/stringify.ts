import { compose, ref, watch } from "steel-frame";

class Class {
  #obj = {
    $prop: ref(2),
  };

  compose() {
    return compose(() => {
      watch(() => {
        let x = [this.#obj.$prop, this.#obj["$prop"]];
      });
    });
  }
}
