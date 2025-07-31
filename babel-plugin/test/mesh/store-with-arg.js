import { store, $ as VasilleWeb } from "vasille-web";
const S = store(({
  a
}) => {
  const b = VasilleWeb.fo(a);
  const c = VasilleWeb.ex((Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [a, b]);
  const d = VasilleWeb.r("static");
  return {
    $a: a,
    $b: b,
    $c: c,
    dispatchB(newB) {
      b.$$ = newB;
    },
    dispatchD(newD) {
      d.$ = newD;
    }
  };
}, "VasilleWeb:S");
