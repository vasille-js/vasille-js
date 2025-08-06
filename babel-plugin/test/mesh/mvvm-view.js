import { mvvmView, $ as VasilleWeb } from "vasille-web";
const C = mvvmView(function C(Vasille, {
  name = VasilleWeb.r("name"),
  ["data"]: d,
  ...rest
}) {
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(Vasille.expr(Vasille_d => Vasille_d.id, [d]));
    Vasille.text(":");
    Vasille.text(name);
    Vasille.text(Vasille.expr(Vasille_d => Vasille_d.width, [d]));
    Vasille.text("/");
    Vasille.text(Vasille.expr(Vasille_d => Vasille_d.height, [d]));
    Vasille.text("...");
    Vasille.text(rest.more);
  });
  console.log(d.$.id, d.$.width, d.$.height, name.$, rest.more.$);
}, "VasilleWeb:C");
