import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = 3;
  const b = Vasille.ref(4, "b");
  const c = Vasille.ref(5, "c");
  Vasille.watch(Vasille_b => {
    c.$ = a + Vasille_b;
  }, [b]);
}, "VasilleWeb:C");
