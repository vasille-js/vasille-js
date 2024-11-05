import * as DX from "vasille-dx";
export const C = DX.compose(function VasilleDX_C() {
  const DX1 = {
    compose() {
      return 3;
    }
  };
  const sum = DX1.compose() + 2;
});