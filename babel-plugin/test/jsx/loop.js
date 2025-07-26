import { For, compose, Debug, $ as VasilleDX } from "vasille-dx";
export const C = compose(Vasille => {
  const a = VasilleDX.am(Vasille, [1, 2, 3], "a");
  const map = VasilleDX.mm(Vasille, [['x', 1]], "map");
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
}, "VasilleDX:C");
