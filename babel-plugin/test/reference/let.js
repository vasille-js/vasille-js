import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref(3, "a");
}, "VasilleWeb:C");
