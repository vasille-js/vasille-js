import { arrayModel, ArrayModelView, ArrayView, compose, mapModel, MapModelView, setModel, SetModelView, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $arr = VasilleRef([1, 2, 3]);
  const am = arrayModel(Vasille, [1, 2, 3]);
  const sm = setModel(Vasille, arr);
  const mm = mapModel(Vasille, [[1, 2], [3, 4]]);
  ArrayView({
    "$of": $arr,
    slot: (Vasille, $item, $index) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text(VasilleExpr(Vasille, (Vasille_0, Vasille_1) => Vasille_0 + Vasille_1, [$item, $index]));
      });
    }
  }, Vasille);
  ArrayModelView({
    of: am,
    slot: (Vasille, value, $index) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text(VasilleExpr(Vasille, Vasille_0 => value + Vasille_0, [$index]));
      });
    }
  }, Vasille);
  SetModelView({
    of: sm,
    slot: (Vasille, value) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text(value);
      });
    }
  }, Vasille);
  MapModelView({
    of: mm,
    slot: (Vasille, $value, key) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0 + key, [$value]));
      });
    }
  }, Vasille);
});