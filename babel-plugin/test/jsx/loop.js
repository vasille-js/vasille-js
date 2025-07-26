import { For, compose, Debug, $ as VasilleDX } from "vasille-dx";
export const C = compose(Vasille => {
  const a = VasilleDX.am(Vasille, [1, 2, 3], "a");
  For(Vasille, {
    of: a,
    slot: (Vasille, value) => {
      Debug(Vasille, {
        model: value
      });
    }
  });
  For(Vasille, {
    of: a,
    slot: (Vasille, value) => {
      console.log(value);
    }
  });
}, "VasilleDX:C");
