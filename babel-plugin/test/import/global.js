import * as DX from "vasille-web";
export const C = DX.compose((Vasille, {
  a
}) => {
  a.$ = 3;
}, "VasilleWeb:C");
