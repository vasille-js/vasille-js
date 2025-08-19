import { compose, ref, expr as VasilleExpr } from "vasille-web";
const o = {
  $a: ref(2)
};
const c = compose(Vasille => {
  const o1 = {
    a: 1
  };
  const $c1 = o.$a;
  const c2 = o1.a;
  const $s = VasilleExpr(Vasille, Vasille_c1 => Vasille_c1 + c2, [$c1], "s");
}, "c");
