import { bind, component } from "vasille-web";

const C = component(() => {
  let $a = 1;
  const $b = bind($a + 1);
});
