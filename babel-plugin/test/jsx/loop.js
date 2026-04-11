import { For, compose, arrayModel as VasilleArrayModel, mapModel as VasilleMapModel } from "vasille-web";
const C = compose(Vasille => {
  const a = VasilleArrayModel(Vasille, [1, 2, 3]);
  const map = VasilleMapModel(Vasille, [["x", 1]]);
  For({
    of: a,
    slot: (Vasille, value) => {
      Vasille.text(value);
    }
  }, Vasille);
  For({
    of: map,
    slot: (Vasille, value, key) => {
      console.log(value, key);
    }
  }, Vasille);
});
