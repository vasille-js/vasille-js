import { For, compose, Debug, arrayModel as VasilleArrayModel, mapModel as VasilleMapModel, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const a = VasilleArrayModel(Vasille, [1, 2, 3], "a");
  const map = VasilleMapModel(Vasille, [["x", 1]], "map");
  For({
    of: a,
    slot: (Vasille, value) => {
      Debug({
        "$model": VasilleRef(value)
      }, Vasille);
    }
  }, Vasille);
  For({
    of: map,
    slot: (Vasille, value, key) => {
      console.log(value, key);
    }
  }, Vasille);
}, "C");
