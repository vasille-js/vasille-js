import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref("text", "a");
  Vasille.text("text text2");
  Vasille.text("text");
  Vasille.text(a);
  Vasille.tag("div", {});
  Vasille.text("text3");
}, "VasilleWeb:C");
