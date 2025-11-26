import { calculate, component } from "steel-frame";

const C = component(() => {
  let $a = 1;
  const $b = calculate(() => {
    return $a + 1;
  });
});
