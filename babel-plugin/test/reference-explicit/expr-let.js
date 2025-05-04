import { compose } from "vasille-explicit";
export const C = compose(function VasilleEX_C(Vasille) {
  const a = Vasille.ref(2);
  const b = Vasille.ref(3);
  const c = Vasille.ref(4);
  const sum = Vasille.own(Vasille.expr((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, a, b));
  console.log(sum.$);
  sum.$$ = b;
  sum.$$ = c;
});