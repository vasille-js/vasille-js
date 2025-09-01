import { compose, ref as VasilleRef, match as VasilleMatch } from "vasille-web";
const key = "a";
const C = compose(Vasille => {
  const a = {
    $a: VasilleRef(1),
    [key]: VasilleMatch(key, 2)
  };
}, "C");
