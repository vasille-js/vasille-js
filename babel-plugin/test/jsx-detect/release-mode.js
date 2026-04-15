import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(3);
  const b = [1, 2, $a.V];
  const c = new Set([1, 2, $a.V]);
  const d = new Map([[1, $a.V], [2, 3]]);
  const e = {
    f: 1,
    e: 2,
    $g: $a
  };
  const $f = VasilleRef(4);
  const $g = VasilleRef($a.V + $f.V);
});
