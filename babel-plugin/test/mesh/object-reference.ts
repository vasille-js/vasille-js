import { compose } from "steel-frame";

const C = compose(() => {
  let $a = {
    a: 1,
  };
  let $b = [1];
  let $c = new Map<number, number>();

  const $d = $a.a;
  const $e = $b[0];
  const $f = $c.has(1);
});
