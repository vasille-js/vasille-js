import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = VasilleRef(3, "b");
  const $sum = VasilleExpr(Vasille, (Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [$a, $b], "sum");
  console.log($sum.V);
}, "C");
