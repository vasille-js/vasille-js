import { bind, calculate, compose, raw, ref } from "steel-frame";

const C = compose(() => {
  let $arr = ref([1, 2, 3]);
  let $index = ref(0);
  const $implicit = $arr[$index];
  const $explicit = bind($arr[$index]);
  const $computed = calculate(() => {
    return $arr[$index];
  });
  const unwrapped = raw($arr[$index]);
});
