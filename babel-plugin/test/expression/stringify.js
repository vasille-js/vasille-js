import { compose, ref, watch } from "vasille-web";
class Class {
  #obj = {
    $prop: ref(2)
  };
  compose() {
    return compose(Vasille => {
      watch(Vasille, Vasille__obj_prop => {
        let x = [Vasille__obj_prop, Vasille__obj_prop];
      }, [this.#obj.$prop]);
    }, "#");
  }
}
