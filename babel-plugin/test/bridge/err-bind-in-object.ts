import { bind, compose } from "steel-frame";

const C = compose(() => {
  let $a = 1,
    $b = 2;

  const o = {
    $sum: $a + $b,
  };
});
