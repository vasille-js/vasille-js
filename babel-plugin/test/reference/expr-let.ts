import { beforeMount, calculate, compose } from "vasille-web";

export const C = compose(() => {
  let $a = 2;
  let $b = 3;
  let $c = 4;
  let $sum = $a + $b;

  beforeMount(() => console.log($sum));

  beforeMount(() => $sum = $b);
  beforeMount(() => $sum = $b + $c);
});
