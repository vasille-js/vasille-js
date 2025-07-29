import { For, compose, Debug, $ as VasilleWeb } from "vasille-web";
export const C = compose(Vasille => {
  const a = VasilleWeb.am(Vasille, [1, 2, 3], "a");
  const map = VasilleWeb.mm(Vasille, [["x", 1]], "map");
  For(Vasille, {
    of: a,
    slot: (Vasille, value) => {
      Debug(Vasille, {
        model: value
      });
    }
  });
  For(Vasille, {
    of: map,
    slot: (Vasille, value, key) => {
      console.log(value, key);
    }
  });
}, "VasilleWeb:C");
