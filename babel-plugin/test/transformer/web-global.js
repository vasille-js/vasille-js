// @ts-expect-error
import * as V from "vasille-web";
const C = V.compose(Vasille => {
  const a = Vasille.ref(1, "a");
}, "VasilleWeb:C");
