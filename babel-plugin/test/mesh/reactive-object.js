import { compose, store, $ as VasilleWeb } from "vasille-web";
const obj = {
  a: 1,
  b: 2
};
export const S = store(() => {
  const a = VasilleWeb.r(2);
  const b = VasilleWeb.fo(VasilleWeb.r(3));
  const o = VasilleWeb.sro({
    a: 1,
    b: {
      c: 3
    }
  });
  return {
    $a: a,
    $b: VasilleWeb.fo(b),
    $$o: o
  };
}, "VasilleWeb:S");
const s = S();
const Component = compose(Vasille => {
  const a = s.$a;
  const b = s.$b;
  const o0 = s["$$o"];
  const o1 = s.$$o;
  const o2 = obj;
  console.log(a.$, b.$, o0.b.$.c, o1.a.$, o2.a);
  Vasille.watch((Vasille_a, Vasille_b, Vasille_o0_b, Vasille_o1_a) => {
    console.log(Vasille_a, Vasille_b, Vasille_o0_b.c, Vasille_o1_a, o2.a);
  }, [a, b, o0.b, o1.a]);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(a);
    Vasille.text(b);
    Vasille.text(Vasille.expr(Vasille_o0_b => Vasille_o0_b.c, [o0.b]));
    Vasille.text(o1.a);
    Vasille.text(o2.a);
  });
}, "VasilleWeb:Component");
