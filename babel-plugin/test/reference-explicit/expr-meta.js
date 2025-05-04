import { compose } from "vasille-explicit";
export const C = compose(function VasilleEX_C(Vasille) {
  const a = Vasille.ref(2);
  let b = a.$;
  const c = Vasille.expr(Vasille_a => Vasille_a + b, a);
  const d = Vasille.expr((Vasille_a, Vasille_c) => {
    return Vasille_a + b + Vasille_c;
  }, a, c);
  let e = Vasille.expr(Vasille_a => Vasille_a + b, a);
  let f = (() => a.$ + b)();
  console.log(a.$, b, c.$, d.$, e.$, f);
});