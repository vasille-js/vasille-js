import { bind, component } from "steel-frame";

const C = component(() => {
  let $a = 1;
  const $b = bind($a + 1);
});
