import { compose, ref, watch } from "vasille-web";

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
