import { compose, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = VasilleRef(3, "b");
  const $c = VasilleRef(4, "c");
  const $sum = VasilleRef($a.V + $b.V, "sum");
  VasilleSafe(() => console.log($sum.V))();
  VasilleSafe(() => $sum.V = $b.V)();
  VasilleSafe(() => $sum.V = $b.V + $c.V)();
}, "C");
