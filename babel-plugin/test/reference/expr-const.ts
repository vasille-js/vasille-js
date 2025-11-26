import { beforeMount, compose } from "steel-frame";

const C = compose(() => {
  let $a = 2;
  let $b = 3;
  const $sum = $a + $b;

  beforeMount(() => console.log($sum));
});
