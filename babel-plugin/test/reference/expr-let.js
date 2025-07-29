import { compose, $ as VasilleWeb } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref(2, "a");
  const b = Vasille.ref(3, "b");
  const c = Vasille.ref(4, "c");
  const sum = Vasille.own(VasilleWeb.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]), "sum");
  console.log(sum.$$);
  sum.$$ = VasilleWeb.fo(b);
  sum.$$ = VasilleWeb.ex((Vasille_b, Vasille_c) => {
    return Vasille_b + Vasille_c;
  }, [b, c]);
}, "VasilleWeb:C");
