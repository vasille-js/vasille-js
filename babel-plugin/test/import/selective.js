import { compose, $ } from "vasille-dx";
export const C = compose(function VasilleDX_C({
  a = $.r(0)
}) {
  a.$ = 3;
});