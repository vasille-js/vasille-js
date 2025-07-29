import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const recusive = function compose(x) {
    return x <= 0 ? 1 : compose(x - 1) + x;
  };
  const sum = recusive(2);
}, "VasilleWeb:C");
