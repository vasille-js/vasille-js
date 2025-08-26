import { bind, compose } from "vasille-web";

const C = compose(() => {
  let $a = 1, $b = 2;

  const o = {
    $sum: $a + $b,
  };
});
