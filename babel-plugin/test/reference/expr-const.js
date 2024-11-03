import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const a = this.ref(2);
  const b = this.ref(3);
  const sum = this.expr((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, a, b);
  console.log(sum.$);
});