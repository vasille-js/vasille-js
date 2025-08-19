import { bind, compose, store, watch, ref as VasilleRef, ensure as VasilleEnsure } from "vasille-web";
const obj = {
  a: 1,
  b: 2
};
export const S = store(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = VasilleRef(3, "b");
  const o = {
    a: 1,
    $b: VasilleRef({
      c: 3
    })
  };
  console.log(o.$b.V.c);
  return {
    $a: $a,
    $b: $b,
    o: o
  };
}, "S");
const s = S;
const Component = compose(Vasille => {
  const $a = VasilleEnsure(s.$a);
  const $b = VasilleEnsure(s.$b);
  const $bc1 = watch(Vasille, Vasille_s_o_b => Vasille_s_o_b.c, [s.o.$b], "bc1");
  const $bc2 = watch(Vasille, Vasille_s_o_b => Vasille_s_o_b?.c, [s.o.$b], "bc2");
  watch(Vasille, (Vasille_a, Vasille_b, Vasille_s_o_b) => {
    console.log(Vasille_a, Vasille_b, Vasille_s_o_b.c, Vasille_s_o_b?.c);
  }, [$a, $b, s.o.$b]);
  console.log($a.V, $b.V, s.o.$b.V.c, s.o.$b?.V?.c);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text($a);
    Vasille.text($b);
    Vasille.text(watch(Vasille, Vasille_s_o_b => Vasille_s_o_b.c, [s.o.$b]));
    Vasille.text(watch(Vasille, Vasille_s_o_b => Vasille_s_o_b?.c, [s.o.$b]));
  });
}, "Component");
