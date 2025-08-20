import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = VasilleRef(3, "b");
  const $c = VasilleRef(4, "c");
  const $sum = VasilleRef($a.V + $b.V, "sum");
  console.log($sum.V);
  $sum.V = $b.V;
  $sum.V = $b.V + $c.V;
}, "C");
