import * as DX from "vasille-web";
export const C = DX.compose(Vasille => {
  const [err, result, retry] = DX.awaited(Vasille, new Promise(rv => {
    rv(0);
  }), "err", "result");
  console.log(err.$, result.$, retry);
}, "VasilleWeb:C");
