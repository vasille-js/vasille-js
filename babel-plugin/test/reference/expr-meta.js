import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref(2);
  let b = a.$;
  const c = Vasille.expr(Vasille_a => Vasille_a + b, a);
  const d = Vasille.expr((Vasille_a, Vasille_c) => {
    return Vasille_a + b + Vasille_c;
  }, a, c);
  const e = Vasille.own(VasilleDX.ex(Vasille_a => Vasille_a + b, a));
  let f = (() => a.$ + b)();
  console.log(a.$, b, c.$, d.$, e.$$, f);
});