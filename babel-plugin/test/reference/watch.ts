import { compose, watch } from "steel-frame";

const C = compose(() => {
  const a = 3;
  let $b = 4;
  let $c = 5;

  watch(() => {
    $c = a + $b;
  });
});
