import { hybridView, $ as VasilleWeb } from "vasille-web";
const C = hybridView(function C(Vasille, {
  model = "model",
  ["data"]: d,
  name = VasilleWeb.r("name")
}) {
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(d.id);
    Vasille.text(":");
    Vasille.text(name);
    Vasille.text(d.width);
    Vasille.text("/");
    Vasille.text(d.height);
    Vasille.text(" + ");
    Vasille.text(model);
  });
  console.log(d.id, d.width, d.height, name.$, model);
}, ["model", "data"], "VasilleWeb:C");
