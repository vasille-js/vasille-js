import { compose, ref, watch } from "vasille-web";
class Class {
  #obj = {
    $prop: ref(2)
  };
  compose() {
    return compose(Vasille => {
      watch(Vasille, (Vasille_0, Vasille_1) => {
        let x = [Vasille_0, Vasille_1];
      }, [this.#obj.$prop, this.#obj["$prop"]]);
    });
  }
}
