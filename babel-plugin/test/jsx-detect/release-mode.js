import { compose, ref as VasilleRef, arrayModel as VasilleArrayModel, setModel as VasilleSetModel, mapModel as VasilleMapModel } from "vasille-web";
export const C = compose(Vasille => {
  const $a = VasilleRef(3);
  const b = VasilleArrayModel(Vasille, [1, 2, $a.V]);
  const c = VasilleSetModel(Vasille, [1, 2, $a.V]);
  const d = VasilleMapModel(Vasille, [[1, $a.V], [2, 3]]);
  const e = {
    f: 1,
    e: 2,
    $g: $a
  };
  const $f = VasilleRef(4);
  const $g = VasilleRef($a.V + $f.V);
  ;
});
