import { arrayModel, bind, calculate, mapModel, raw, ref, setModel, watch } from "vasille-web";

let $a = ref(1);
let $b = ref(2);

const arr = arrayModel(...[[$a, 2, 3]]);
const set = setModel([1, $b, 3]);
const map = mapModel([
  [1, 2],
  [$a, 2],
]);

const $sum = bind($a + $b);
const $inc = bind($a + 1);
const $aa = bind($a);
const $1 = bind(1);

const $composed = calculate(() => {
  return $a + 4 + $sum;
});

const obj = {
  $a: ref(1),
  b: raw($a),
};

let a = raw($a);

watch(() => {
  a = $a;
});
