import { arrayModel, bind, calculate, mapModel, ref, setModel, watch, forward as VasilleForward } from "vasille-web";
let $a = ref(1);
let $b = ref(2);
const arr = arrayModel(null, ...[[$a.V, 2, 3]]);
const set = setModel(null, [1, $b.V, 3]);
const map = mapModel(null, [[1, 2], [$a.V, 2]]);
const $sum = bind(null, (Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [$a, $b]);
const $inc = bind(null, Vasille_a => Vasille_a + 1, [$a]);
const $aa = VasilleForward(null, $a);
const $1 = ref(1);
const $composed = calculate(null, (Vasille_a, Vasille_sum) => {
  return Vasille_a + 4 + Vasille_sum;
}, [$a, $sum]);
const obj = {
  $a: ref(1),
  b: $a.V
};
let a = $a.V;
watch(null, Vasille_a => {
  a = Vasille_a;
}, [$a]);