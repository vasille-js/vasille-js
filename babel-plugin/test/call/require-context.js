import * as DX from "vasille-web";
const C = DX.compose(Vasille => {
  const [$err, $result, retry] = DX.awaited(Vasille, () => new Promise(rv => {
    rv(0);
  }), "err", "result");
  console.log($err.V, $result.V, retry);
}, "C");
