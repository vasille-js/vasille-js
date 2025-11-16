import * as DX from "vasille-web";
const C = DX.compose((Vasille, {
  $a = DX.ref()
}) => {
  DX.safe(() => $a.V = 3)();
});
