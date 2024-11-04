import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const a = 3;
  const b = this.ref(4);
  const c = this.ref(5);
  this.watch(Vasille_b => {
    c.$ = a + Vasille_b;
  }, b);
});