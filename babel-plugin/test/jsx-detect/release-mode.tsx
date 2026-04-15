import { compose, unwrap } from "steel-frame";

const C = compose(() => {
  let $a = 3;
  const b = [1, 2, unwrap($a)];
  const c = new Set([1, 2, unwrap($a)]);
  const d = new Map([
    [1, unwrap($a)],
    [2, 3],
  ]);
  const e = {
    f: 1,
    e: 2,
    $g: $a,
  };
  let $f = 4;
  let $g = $a + $f;
});
