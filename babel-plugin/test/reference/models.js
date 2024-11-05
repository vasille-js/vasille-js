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
  console.log(a.$, b[0], c.has(a.$), d.get(1), e.g.$);
});