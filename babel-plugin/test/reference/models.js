import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref(3);
  const b = VasilleDX.am(Vasille, [1, 2, a.$]);
  const c = VasilleDX.sm(Vasille, [1, 2, a.$]);
  const d = VasilleDX.mm(Vasille, [[1, a.$], [2, 3]]);
  const e = VasilleDX.ro(Vasille, {
    f: 1,
    e: 2,
    g: a.$
  });
  const f = VasilleDX.ro(Vasille, {
    a: 1
  });
  const g = VasilleDX.am(Vasille, [1]);
  const h = VasilleDX.sm(Vasille, [2]);
  const i = VasilleDX.mm(Vasille, [[1, [2]]]);
  const k = Vasille.ref([1]);
  const m = Vasille.ref(new Set([2]));
  const n = Vasille.ref(new Map([[1, [2]]]));
  console.log(a.$, b[0], c.has(a.$), d.get(1), e.g.$);
  console.log(f.a.$, g[0], h.has(2), i.get(1), k.$[0], m.$.has(2), n.$.get(1));
});