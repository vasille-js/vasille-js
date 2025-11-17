import { calculate, component } from "vasille-web";

const C = component(() => {
  let $a = 1;
  const $b = calculate(() => {
    return $a + 1;
  });
});
