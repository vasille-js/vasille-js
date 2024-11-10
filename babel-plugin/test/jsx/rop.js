import { compose, $ as VasilleDX } from "vasille-dx";
export const C1 = compose(function VasilleDX_C1(Vasille, {
  a
}) {
  console.log(a.$.b);
});
export const C2 = compose(function VasilleDX_C2(Vasille) {
  const o = VasilleDX.ro(Vasille, {
    b: 1
  });
  C1(Vasille, {
    a: VasilleDX.rop(o)
  });
});