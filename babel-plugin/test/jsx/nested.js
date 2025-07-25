import { compose } from "vasille-dx";
export const C1 = compose(Vasille => {
  Vasille.tag("div", {});
}, "VasilleDX:C1");
export const C2 = compose(Vasille => {
  Vasille.tag("div", {}, Vasille => {
    C1(Vasille, {});
  });
  C1(Vasille, {});
}, "VasilleDX:C2");
