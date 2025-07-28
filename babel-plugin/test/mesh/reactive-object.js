import { compose, $ as VasilleDX } from "vasille-dx";
const obj = {
  a: 1,
  b: 2
};
export const S = () => {
  const a = VasilleDX.r(2);
  const b = VasilleDX.fo(VasilleDX.r(3));
  const o = VasilleDX.sro({
    a: 1,
    b: {
      c: 3
    }
  });
  return {
    $a: a,
    $b: VasilleDX.fo(b),
    $$o: o
  };
};
const s = S();
const Component = compose(Vasille => {
  const a = s.$a;
  const b = s.$b;
  const o = s.$$o;
  const o2 = obj;
  console.log(a.$, b.$, o.b.$.c, o2.a);
  Vasille.watch((Vasille_a, Vasille_b, Vasille_o_b) => {
    console.log(Vasille_a, Vasille_b, Vasille_o_b.c, o2.a);
  }, [a, b, o.b]);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(a);
    Vasille.text(b);
    Vasille.text(Vasille.expr(Vasille_o_b => Vasille_o_b.c, [o.b]));
    Vasille.text(o2.a);
  });
}, "VasilleDX:Component");
