import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref("text");
  Vasille.tag("div", {}, Vasille => {
    Vasille.text("text1 Hello ");
    Vasille.text("world");
    Vasille.text(a);
    Vasille.text(" is text");
    Vasille.tag("div", {});
  });
});