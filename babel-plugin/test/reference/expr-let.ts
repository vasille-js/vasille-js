import { calculate, compose } from "vasille-web";

export const C = compose(() => {
  let $a = 2;
  let $b = 3;
  let $c = 4;
  let $sum = $a + $b;

  console.log($sum);

  $sum = $b;
  $sum = calculate(() => {
    return $b + $c;
  });
});
