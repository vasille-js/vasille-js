import * as DX from "vasille-dx";

export const C = DX.compose(() => {
  const DX1 = DX.value({
    compose() {
      return 3;
    },
  });
  const sum = DX1.compose() + 2;
});
