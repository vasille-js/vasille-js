import { compose, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const $a = VasilleRef("text", "a");
  Vasille.tag("div", {}, Vasille => {
    Vasille.text("text1 Hello ");
    Vasille.text("world");
    Vasille.text($a);
    Vasille.text(" is text");
    Vasille.tag("div", {});
  });
}, "C");
