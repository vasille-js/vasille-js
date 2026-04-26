import * as DX from "vasille-web";
const C = DX.compose(Vasille => {
  const [$err, $result, retry] = DX.awaited(() => new Promise(rv => {
    rv(0);
  }), Vasille);
  DX.safe(() => console.log($err.V, $result.V, retry))();
});
