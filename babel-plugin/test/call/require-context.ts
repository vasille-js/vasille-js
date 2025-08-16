import * as DX from "vasille-web";

export const C = DX.compose(() => {
  const [$err, $result, retry] = DX.awaited(
    () =>
      new Promise(rv => {
        rv(0);
      }),
  );

  console.log($err, $result, retry);
});
