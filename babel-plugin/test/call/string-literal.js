import * as DX from "vasille-web";
const C = DX["compose"]((Vasille, {
  a
}) => {
  DX.safe(() => a = 3)();
});
