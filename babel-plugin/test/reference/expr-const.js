import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(2, "a");
  const b = Vasille.ref(3, "b");
  const sum = Vasille.expr((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b], "sum");
  console.log(sum.$);
}, "VasilleDX:C");
