import * as DX from "vasille-web";
export const C = DX.compose((Vasille, {
  $a = DX.ref()
}) => {
  $a.V = 3;
}, "C");
