import { bind, compose, store, watch, ref as VasilleRef } from "vasille-web";
const obj = {
  a: 1,
  b: 2
};
export const S = store(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = VasilleRef(3, "b");
  const o = {
    a: 1,
    b: {
      c: 3
    }
  };
  const {
    b: b0,
    ...o0
  } = o;
  console.log(b0, o0.a);
  return {
    $a: $a,
    $b: $b,
    o: o,
    $b0: VasilleRef(b0),
    o0: o0
  };
}, "S");
const s = S;
const Component = compose(Vasille => {
  const $a = s.$a;
  const $b = s.$b;
  const o0 = s["o"];
  const o1 = s.o;
  const o2 = obj;
  console.log($a.V, $b.V, o0.b.c, o1.a, o2.a);
  watch(Vasille, (Vasille_a, Vasille_b) => {
    console.log(Vasille_a, Vasille_b, o0.b.c, o1.a, o2.a);
  }, [$a, $b]);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text($a);
    Vasille.text($b);
    Vasille.text(o0.b.c);
    Vasille.text(o1.a);
    Vasille.text(o2.a);
  });
}, "Component");
