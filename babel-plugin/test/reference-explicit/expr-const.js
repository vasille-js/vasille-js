import { compose } from "vasille-explicit";
export const C = compose(function VasilleEX_C(Vasille) {
  const a = Vasille.ref(2);
  const b = Vasille.ref(3);
  const sum = Vasille.expr((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, a, b);
  console.log(sum.$);
});