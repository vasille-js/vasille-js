import * as DX from "vasille-web";
export const C = DX.compose(Vasille => {
  const a = DX.awaited(Vasille, new Promise(rv => {
    rv(0);
  }), "#", "#");
}, "VasilleWeb:C");
