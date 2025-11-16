import { compose, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2);
  const $b = VasilleRef(3);
  const $c = VasilleRef(4);
  const $sum = VasilleRef($a.V + $b.V);
  VasilleSafe(() => console.log($sum.V))();
  VasilleSafe(() => $sum.V = $b.V)();
  VasilleSafe(() => $sum.V = $b.V + $c.V)();
});
