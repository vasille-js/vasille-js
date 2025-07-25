import * as DX from "vasille-dx";
export const C = DX.compose(Vasille => {
  const a = DX.awaited(Vasille, new Promise(rv => {
    rv(0);
  }));
}, "VasilleDX:C");
