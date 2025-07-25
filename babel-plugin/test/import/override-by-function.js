import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  function compose() {
    return 3;
  }
  const sum = compose() + 2;
}, "VasilleDX:C");
