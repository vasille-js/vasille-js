import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = 3;
  const b = Vasille.ref(4);
  const c = Vasille.ref(5);
  Vasille.watch(Vasille_b => {
    c.$ = a + Vasille_b;
  }, b);
});