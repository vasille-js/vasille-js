import { compose, $ as VasilleDX } from "vasille-dx";
export const C = () => {
  const a = VasilleDX.r(2);
  const b = VasilleDX.r(2);
  const c = VasilleDX.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]);
  const d = VasilleDX.fo(c);
  const e = VasilleDX.sam([1, 2]);
  const f = VasilleDX.ssm([1, 2]);
  const g = VasilleDX.smm([[1, 2]]);
  const h = VasilleDX.sro({
    a: 1
  });
  const i = VasilleDX.fo(VasilleDX.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]));
  const j = VasilleDX.sam();
  const k = VasilleDX.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]);
  const o = VasilleDX.r({
    a: {
      b: 1
    }
  });
  return {
    $a: a,
    $b: b,
    $c: c,
    $d: d,
    e: e,
    f: f,
    g: g,
    $$h: h,
    $i: i,
    j: j,
    $k: k,
    $o: o
  };
};
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
}, "VasilleDX:Component");
