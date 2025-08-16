import { compose, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const $a = VasilleRef("text", "a");
  Vasille.text("text text2");
  Vasille.text("text");
  Vasille.text($a);
  Vasille.tag("div", {});
  Vasille.text("text3");
}, "C");
