import * as DX from "steel-frame";

const C = DX.compose(() => {
  const [$err, $result, retry] = DX.awaited(
    () =>
      new Promise(rv => {
        rv(0);
      }),
  );

  DX.beforeMount(() => console.log($err, $result, retry));
});
