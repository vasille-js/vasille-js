import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(3, "a");
  let a = 3;
}, "C");
