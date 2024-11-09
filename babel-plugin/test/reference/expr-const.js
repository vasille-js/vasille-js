import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref(2);
  const b = Vasille.ref(3);
  const sum = Vasille.expr((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, a, b);
  console.log(sum.$);
});