import { compose, $ as VasilleWeb } from "vasille-web";
export const C1 = compose((Vasille, {
  a
}) => {
  console.log(a.$.b);
}, "VasilleWeb:C1");
export const C2 = compose(Vasille => {
  const o = VasilleWeb.ro(Vasille, {
    b: 1
  }, "o");
  C1(Vasille, {
    a: VasilleWeb.rop(o)
  });
}, "VasilleWeb:C2");
