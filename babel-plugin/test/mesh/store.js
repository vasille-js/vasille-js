import { compose, store, $ as VasilleWeb } from "vasille-web";
export const C = store(() => {
  const a = VasilleWeb.r(2);
  const b = VasilleWeb.r(2);
  const c = VasilleWeb.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]);
  const d = VasilleWeb.fo(c);
  const e = VasilleWeb.sam([1, 2]);
  const f = VasilleWeb.ssm([1, 2]);
  const g = VasilleWeb.smm([[1, 2]]);
  const h = VasilleWeb.sro({
    a: 1
  });
  const i = VasilleWeb.fo(VasilleWeb.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]));
  const j = VasilleWeb.sam();
  const k = VasilleWeb.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]);
  const o = VasilleWeb.r({
    a: {
      b: 1
    }
  });
  const m = VasilleWeb.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]);
  const n = VasilleWeb.r(2);
  const p = 3;
  const q = VasilleWeb.sam();
  const r = VasilleWeb.ssm();
  const s = VasilleWeb.smm();
  const t = VasilleWeb.sro({});
  const u = VasilleWeb.fo(m);
  VasilleWeb.ex(Vasille_o => {
    console.log(Vasille_o);
  }, [o]);
  return {
    $a: a,
    $b: b,
    $c: c,
    $d: d,
    e: e,
    f: f,
    ["g"]: g,
    ["$$h"]: h,
    $i: i,
    j: j,
    $k: k,
    $o: o
  };
}, "VasilleWeb:C");
const c = C();
const Component = compose(Vasille => {
  console.log(c["$a"].$, c.$b.$, c.$c.$, c.$d.$, c.e, c.f, c.g, c["$$h"].a.$, c.$i.$, c.j, c.$k.$, c.$o.$.a.b);
  Vasille.watch((Vasille_c_$a, Vasille_c_$b, Vasille_c_$c, Vasille_c_$d, Vasille_c_$$h_a, Vasille_c_$i, Vasille_c_$k, Vasille_c_$o) => {
    console.log(Vasille_c_$a, Vasille_c_$b, Vasille_c_$c, Vasille_c_$d);
    console.log(c.e, c.f, c.g);
    console.log(Vasille_c_$$h_a, Vasille_c_$i, c.j);
    console.log(Vasille_c_$k, Vasille_c_$o.a.b);
  }, [c.$a, c.$b, c.$c, c.$d, c.$$h.a, c.$i, c.$k, c.$o]);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(c.$a);
    Vasille.text(c.$b);
    Vasille.text(c.$c);
    Vasille.text(c.$d);
    Vasille.text(c.e);
    Vasille.text(c.f);
    Vasille.text(c.g);
    Vasille.text(c.$$h.a);
    Vasille.text(c.$i);
    Vasille.text(c.j);
    Vasille.text(c.$k);
    Vasille.text(Vasille.expr(Vasille_c_$o => Vasille_c_$o.a.b, [c.$o]));
  });
}, "VasilleWeb:Component");
