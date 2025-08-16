import { compose, Debug } from "vasille-web";

export const C = compose(() => {
  let $a = 3;
  const b = [1, 2, $a];
  const c = new Set([1, 2, $a]);
  const d = new Map([
    [1, $a],
    [2, 3],
  ]);
  const e = {
    f: 1,
    e: 2,
    $g: $a,
  };
  let $f = 4;
  let $g = $a + $f;

  <Debug $model={$g} />;
});
