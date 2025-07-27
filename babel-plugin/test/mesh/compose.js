import { compose, For, $ as VasilleDX } from "vasille-dx";
const C = compose(function C(Vasille, {
  name = VasilleDX.r("name"),
  ["data"]: d,
  ...rest
}) {
  const model = VasilleDX.am(Vasille, [{
    name: "name1",
    data: {
      id: "x",
      width: 1,
      height: 4
    },
    more: "more"
  }], "model");
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
  For(Vasille, {
    of: model,
    slot: (Vasille, {
      name = "xName",
      data: {
        id,
        width,
        ...rest
      },
      ...rest2
    }) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text(id);
        Vasille.text(":");
        Vasille.text(name);
        Vasille.text(width);
        Vasille.text("/");
        Vasille.text(rest.height);
        Vasille.text("...");
        Vasille.text(rest2.more);
      });
      console.log(id, width, rest.height, name, rest2.more);
    }
  });
}, "VasilleDX:C");
