import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const compose = () => 3;
  const sum = compose() + 2;
}, "VasilleDX:C");
