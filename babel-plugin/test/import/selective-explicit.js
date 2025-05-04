import { Reference } from "vasille";
import { compose } from "vasille-explicit";
export const C = compose(function VasilleEX_C(Vasille, {
  a = new Reference(2)
}) {
  a.$ = 3;
});