import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(3, "a");
  const b = VasilleDX.am(Vasille, [1, 2, a.$], "b");
  const c = VasilleDX.sm(Vasille, [1, 2, a.$], "c");
  const d = VasilleDX.mm(Vasille, [[1, a.$], [2, 3]], "d");
  const e = VasilleDX.ro(Vasille, {
    f: 1,
    e: 2,
    g: a.$
  }, "e");
  const f = VasilleDX.ro(Vasille, {
    a: 1
  }, "f");
  const g = VasilleDX.am(Vasille, [1], "g");
  const h = VasilleDX.sm(Vasille, [2], "h");
  const i = VasilleDX.mm(Vasille, [[1, [2]]], "i");
  const k = Vasille.ref([1], "k");
  const m = Vasille.ref(new Set([2]), "m");
  const n = Vasille.ref(new Map([[1, [2]]]), "n");
  console.log(a.$, b[0], c.has(a.$), d.get(1), e.g.$);
  console.log(f.a.$, g[0], h.has(2), i.get(1), k.$[0], m.$.has(2), n.$.get(1));
}, "VasilleDX:C");
