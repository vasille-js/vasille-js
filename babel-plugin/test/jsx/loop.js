import { For, compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = VasilleDX.am(Vasille, [1, 2, 3]);
  For(Vasille, {
    of: a,
    slot: value => {
      console.log(value);
    }
  });
});