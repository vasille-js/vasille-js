import { compose, $ as VasilleWeb } from "vasille-web";
export const C = compose((Vasille, {
  a = VasilleWeb.r(0)
}) => {
  a.$ = 3;
}, "VasilleWeb:C");
