import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(3, "a");
}, "VasilleDX:C");
