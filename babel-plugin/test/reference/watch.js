import { compose, watch, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const a = 3;
  const $b = VasilleRef(4);
  const $c = VasilleRef(5);
  watch(Vasille, Vasille_0 => {
    $c.V = a + Vasille_0;
  }, [$b]);
});
