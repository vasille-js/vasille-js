import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille, {
  a = VasilleDX.r(0)
}) {
  a.$ = 3;
});