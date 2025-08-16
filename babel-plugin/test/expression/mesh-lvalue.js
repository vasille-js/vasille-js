import { calculate, compose, ref, watch } from "vasille-web";
const obj = {
  $nested: ref({
    level2: 2
  })
};
export const C = compose(Vasille => {
  const $a = ref(2, "a");
  const $sum = calculate(Vasille, (Vasille_a, Vasille_obj_nested) => {
    return Vasille_a + Vasille_obj_nested.level2;
  }, [$a, obj.$nested], "sum");
  watch(Vasille, function update(Vasille_obj_nested, Vasille_a) {
    let rest;
    $a.V = 3;
    obj.$nested.V.level2 = 3;
    [$a.V, obj.$nested.V.level2, ...rest] = [Vasille_obj_nested.level2, Vasille_a];
  }, [obj.$nested, $a]);
}, "C");
