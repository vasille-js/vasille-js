import { compose, reactiveFields, $ as VasilleEX } from "vasille-explicit";
export const C = compose(function VasilleEX_C(Vasille) {
  let a = 3;
  const b = [1, 2, a];
  const c = new Set([1, 2, a]);
  const d = new Map([[1, a], [2, 3]]);
  const e = {
    f: 1,
    e: 2,
    g: a
  };
  const f = reactiveFields({
    a: 1
  });
  const g = VasilleEX.am(Vasille, [1]);
  const h = VasilleEX.sm(Vasille, [2]);
  const i = VasilleEX.mm(Vasille, [[1, [2]]]);
  const k = Vasille.ref([1]);
  const m = Vasille.ref(new Set([2]));
  const n = Vasille.ref(new Map([[1, [2]]]));
  console.log(a, b[0], c.has(a), d.get(1), e.g);
  console.log(f.a.$, g[0], h.has(2), i.get(1), k.$[0], m.$.has(2), n.$.get(1));
});