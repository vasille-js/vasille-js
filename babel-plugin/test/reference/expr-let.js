import { compose, $ } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const a = this.ref(2);
  const b = this.ref(3);
  const c = this.ref(4);
  const sum = this.own($.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, a, b));
  console.log(sum.$$);
  sum.$$ = $.fo(b);
  sum.$$ = $.ex((Vasille_b, Vasille_c) => Vasille_b + Vasille_c, b, c);
});
