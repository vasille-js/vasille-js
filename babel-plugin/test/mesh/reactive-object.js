import { bind, compose, store, watch, ref as VasilleRef, safe as VasilleSafe, ensure as VasilleEnsure } from "vasille-web";
const obj = {
  a: 1,
  b: 2
};
const sStore = store(Vasille => {
  const $a = VasilleRef(2);
  const $b = VasilleRef(3);
  const o = {
    a: 1,
    $b: VasilleRef({
      c: 3
    })
  };
  VasilleSafe(() => console.log(o.$b.V.c))();
  return {
    $a: $a,
    $b: $b,
    o: o
  };
});
const s = sStore;
const Component = compose(Vasille => {
  const $a = VasilleEnsure(s.$a);
  const $b = VasilleEnsure(s.$b);
  const $bc1 = watch(Vasille, Vasille_0 => Vasille_0.c, [s.o.$b]);
  const $bc2 = watch(Vasille, Vasille_0 => Vasille_0?.c, [s.o.$b]);
  watch(Vasille, (Vasille_0, Vasille_1, Vasille_2) => {
    console.log(Vasille_0, Vasille_1, Vasille_2.c, Vasille_2?.c);
  }, [$a, $b, s.o.$b]);
  VasilleSafe(() => console.log($a.V, $b.V, s.o.$b.V.c, s.o.$b?.V?.c))();
  Vasille.tag("div", {}, Vasille => {
    Vasille.text($a);
    Vasille.text($b);
    Vasille.text(watch(Vasille, Vasille_0 => Vasille_0.c, [s.o.$b]));
    Vasille.text(watch(Vasille, Vasille_0 => Vasille_0?.c, [s.o.$b]));
  });
});
