import { arrayModel, bind, calculate, mapModel, ref, setModel, watch } from "vasille-web";
let $a = ref(1);
let $b = ref(2);
const arr = arrayModel(null, ...[[$a.V, 2, 3]]);
const set = setModel(null, [1, $b.V, 3]);
const map = mapModel(null, [[1, 2], [$a.V, 2]]);
const $sum = bind(null, (Vasille_0, Vasille_1) => Vasille_0 + Vasille_1, [$a, $b]);
const $inc = bind(null, Vasille_0 => Vasille_0 + 1, [$a]);
const $aa = $a;
const $1 = ref(1);
const $composed = calculate(null, (Vasille_0, Vasille_1) => {
  return Vasille_0 + 4 + Vasille_1;
}, [$a, $sum]);
const obj = {
  $a: ref(1),
  b: $a.V
};
let a = $a.V;
watch(null, Vasille_0 => {
  a = Vasille_0;
}, [$a]);