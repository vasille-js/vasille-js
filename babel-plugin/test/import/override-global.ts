import * as DX from "vasille-web";

export const C = DX.compose(() => {
  const DX1 = DX.raw({
    compose() {
      return 3;
    },
  });
  const sum = DX1.compose() + 2;
});
