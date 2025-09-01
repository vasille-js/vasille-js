import { calculate, compose, ref } from "vasille-web";

const C = compose(() => {
  let $a = 0;
  const $c = calculate(() => {
    let $obj = {
      $nested: ref(2),
    };

    return $a + $obj.$nested;
  });
});
