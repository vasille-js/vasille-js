import { mvcView } from "vasille-web";
const C = mvcView(function C(Vasille, {
  name = "name",
  ["data"]: d
}) {
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(d.id);
    Vasille.text(":");
    Vasille.text(name);
    Vasille.text(d.width);
    Vasille.text("/");
    Vasille.text(d.height);
  });
  console.log(d.id, d.width, d.height, name);
}, "VasilleWeb:C");
