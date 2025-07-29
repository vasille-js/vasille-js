import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const compose = () => 3;
  const sum = compose() + 2;
}, "VasilleWeb:C");
