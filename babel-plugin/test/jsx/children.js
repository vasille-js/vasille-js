import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref("text", "a");
  Vasille.tag("div", {}, Vasille => {
    Vasille.text("text1 Hello ");
    Vasille.text("world");
    Vasille.text(a);
    Vasille.text(" is text");
    Vasille.tag("div", {});
  });
}, "VasilleWeb:C");
