import * as DX from "vasille-dx";
export const C = DX.compose(Vasille => {
  const DX1 = {
    compose() {
      return 3;
    }
  };
  const sum = DX1.compose() + 2;
}, "VasilleDX:C");
