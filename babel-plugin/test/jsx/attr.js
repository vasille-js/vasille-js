import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef("a");
  const $b = VasilleRef(1);
  Vasille.tag("div", {
    attr: {
      dir: "ltr",
      "data-let": $a,
      "data-derived": VasilleExpr(Vasille, Vasille_0 => Vasille_0 + 1, [$b]),
      contenteditable: true
    }
  });
});
