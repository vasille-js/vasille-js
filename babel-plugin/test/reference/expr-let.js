import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref(2);
  const b = Vasille.ref(3);
  const c = Vasille.ref(4);
  const sum = Vasille.own(VasilleDX.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, a, b));
  console.log(sum.$$);
  sum.$$ = VasilleDX.fo(b);
  sum.$$ = VasilleDX.ex((Vasille_b, Vasille_c) => Vasille_b + Vasille_c, b, c);
});