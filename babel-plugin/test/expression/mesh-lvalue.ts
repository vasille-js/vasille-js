import { calculate, compose, ref, watch } from "steel-frame";

const obj = {
  $nested: ref({
    level2: 2,
  }),
};

const C = compose(() => {
  let $a = 2;
  const $sum = calculate(() => {
    return $a + obj.$nested.level2;
  });

  watch(function update() {
    let rest;

    $a = 3;
    obj.$nested.level2 = 3;
    [$a, obj.$nested.level2, ...rest] = [obj.$nested.level2, $a];
  });
});
