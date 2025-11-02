import { compose, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
const C = compose((Vasille, {
  $a = VasilleRef(0)
}) => {
  VasilleSafe(() => $a.V = 3)();
}, "C");
