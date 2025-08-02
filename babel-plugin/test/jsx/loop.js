import { For, compose, Debug, $ as VasilleWeb } from "vasille-web";
export const C = compose(Vasille => {
  const a = VasilleWeb.am(Vasille, [1, 2, 3], "a");
  const map = VasilleWeb.mm(Vasille, [["x", 1]], "map");
  For({
    of: a,
    slot: (Vasille, value) => {
      Debug({
        model: value
      }, Vasille);
    }
  }, Vasille);
  For({
    of: map,
    slot: (Vasille, value, key) => {
      console.log(value, key);
    }
  }, Vasille);
}, "VasilleWeb:C");
