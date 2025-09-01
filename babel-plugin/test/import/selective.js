import { compose, ref as VasilleRef } from "vasille-web";
const C = compose((Vasille, {
  $a = VasilleRef(0)
}) => {
  $a.V = 3;
}, "C");
