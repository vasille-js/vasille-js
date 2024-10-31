import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const recusive = function compose(x) {
    return x <= 0 ? 1 : compose(x - 1) + x;
  };
  const sum = recusive(2);
});