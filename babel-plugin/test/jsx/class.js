import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref("a");
  Vasille.tag("div", {
    attr: {
      class: "static1 static2"
    },
    class: [a, {
      aIsB: Vasille.expr(Vasille_a => Vasille_a === "b", a)
    }]
  });
});