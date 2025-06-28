import * as DX from "vasille-dx";
export const C = DX.compose(function VasilleDX_C(Vasille) {
  const a = DX.awaited(Vasille, new Promise(rv => {
    rv(0);
  }));
});
