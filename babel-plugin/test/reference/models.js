import { compose, $ } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const a = this.ref(3);
  const b = $.am(this, [1, 2, a.$]);
  const c = $.sm(this, [1, 2, a.$]);
  const d = $.mm(this, [[1, a.$], [2, 3]]);
  const e = $.ro(this, {
    f: 1,
    e: 2,
    g: a.$
  });
  const f = $.ro(this, {
    a: 1
  });
  const g = $.am(this, [1]);
  const h = $.sm(this, [2]);
  const i = $.mm(this, [[1, [2]]]);
  const k = this.ref([1]);
  const m = this.ref(new Set([2]));
  const n = this.ref(new Map([[1, [2]]]));
  console.log(a.$, b[0], c.has(a.$), d.get(1), e.g.$);
  console.log(f.a.$, g[0], h.has(2), i.get(1), k.$[0], m.$.has(2), n.$.get(1));
});