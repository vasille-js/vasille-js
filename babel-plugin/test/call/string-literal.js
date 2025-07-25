import * as DX from "vasille-dx";
export const C = DX["compose"]((Vasille, {
  a
}) => {
  a.$ = 3;
}, "VasilleDX:C");
