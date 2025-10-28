import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef("a", "a");
  const $b = VasilleRef(1, "b");
  Vasille.tag("div", {
    attr: {
      dir: "ltr",
      "data-let": $a,
      "data-derived": VasilleExpr(Vasille, Vasille_b => Vasille_b + 1, [$b]),
      contenteditable: true
    }
  });
}, "C");
