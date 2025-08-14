import { compose, watch, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const a = 3;
  const $b = VasilleRef(4, "b");
  const $c = VasilleRef(5, "c");
  watch(Vasille, Vasille_b => {
    $c.V = a + Vasille_b;
  }, [$b]);
}, "C");
