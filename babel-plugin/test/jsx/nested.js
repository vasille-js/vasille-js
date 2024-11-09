import { compose } from "vasille-dx";
export const C1 = compose(function VasilleDX_C1(Vasille) {
  Vasille.tag("div", {});
});
export const C2 = compose(function VasilleDX_C2(Vasille) {
  Vasille.tag("div", {}, Vasille => {
    C1(Vasille, {});
  });
  C1(Vasille, {});
});