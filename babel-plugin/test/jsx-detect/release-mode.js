import { compose, $ as VasilleWeb } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref(3);
  const b = VasilleWeb.am(Vasille, [1, 2, a.$]);
  const c = VasilleWeb.sm(Vasille, [1, 2, a.$]);
  const d = VasilleWeb.mm(Vasille, [[1, a.$], [2, 3]]);
  const e = VasilleWeb.ro(Vasille, {
    f: 1,
    e: 2,
    g: a.$
  });
  const f = Vasille.ref(4);
  const g = Vasille.own(VasilleWeb.ex((Vasille_a, Vasille_f) => Vasille_a + Vasille_f, [a, f]));
  ;
});
