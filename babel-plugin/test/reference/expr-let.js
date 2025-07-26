import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(2, "a");
  const b = Vasille.ref(3, "b");
  const c = Vasille.ref(4, "c");
  const sum = Vasille.own(VasilleDX.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]), "sum");
  console.log(sum.$$);
  sum.$$ = VasilleDX.fo(b);
  sum.$$ = VasilleDX.ex((Vasille_b, Vasille_c) => {
    return Vasille_b + Vasille_c;
  }, [b, c]);
}, "VasilleDX:C");
