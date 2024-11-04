import { compose, $ } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const a = this.ref(2);
  let b = a.$;
  const c = this.expr(Vasille_a => Vasille_a + b, a);
  const d = this.expr((Vasille_a, Vasille_c) => {
    return Vasille_a + b + Vasille_c;
  }, a, c);
  const e = this.own($.ex(Vasille_a => Vasille_a + b, a));
  let f = (() => a.$ + b)();
  console.log(a.$, b, c.$, d.$, e.$$, f);
});