import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(3);
  const b = VasilleDX.am(Vasille, [1, 2, a.$]);
  const c = VasilleDX.sm(Vasille, [1, 2, a.$]);
  const d = VasilleDX.mm(Vasille, [[1, a.$], [2, 3]]);
  const e = VasilleDX.ro(Vasille, {
    f: 1,
    e: 2,
    g: a.$
  });
  const f = Vasille.ref(4);
  const g = Vasille.own(VasilleDX.ex((Vasille_a, Vasille_f) => Vasille_a + Vasille_f, [a, f]));
  ;
});
