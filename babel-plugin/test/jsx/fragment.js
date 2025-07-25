import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref("text");
  Vasille.text("text text2");
  Vasille.text("text");
  Vasille.text(a);
  Vasille.tag("div", {});
  Vasille.text("text3");
}, "VasilleDX:C");
