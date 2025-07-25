import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose((Vasille, {
  a = VasilleDX.r(0)
}) => {
  a.$ = 3;
}, "VasilleDX:C");
