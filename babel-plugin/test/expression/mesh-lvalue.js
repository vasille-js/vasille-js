import { calculate, compose, ref, watch } from "vasille-web";
const obj = {
  $nested: ref({
    level2: 2
  })
};
const C = compose(Vasille => {
  const $a = ref(2);
  const $sum = calculate(Vasille, (Vasille_0, Vasille_1) => {
    return Vasille_0 + Vasille_1.level2;
  }, [$a, obj.$nested]);
  watch(Vasille, function update(Vasille_0, Vasille_1) {
    let rest;
    $a.V = 3;
    obj.$nested.V.level2 = 3;
    [$a.V, obj.$nested.V.level2, ...rest] = [Vasille_0.level2, Vasille_1];
  }, [obj.$nested, $a]);
});
