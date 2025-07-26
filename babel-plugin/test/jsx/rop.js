import { compose, $ as VasilleDX } from "vasille-dx";
export const C1 = compose((Vasille, {
  a
}) => {
  console.log(a.$.b);
}, "VasilleDX:C1");
export const C2 = compose(Vasille => {
  const o = VasilleDX.ro(Vasille, {
    b: 1
  }, "o");
  C1(Vasille, {
    a: VasilleDX.rop(o)
  });
}, "VasilleDX:C2");
