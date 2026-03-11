import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef({
    a: 1
  });
  const $b = VasilleRef([1]);
  const $c = VasilleRef(new Map());
  const $d = VasilleExpr(Vasille, Vasille_0 => Vasille_0.a, [$a]);
  const $e = VasilleExpr(Vasille, Vasille_0 => Vasille_0[0], [$b]);
  const $f = VasilleExpr(Vasille, Vasille_0 => Vasille_0.has(1), [$c]);
});