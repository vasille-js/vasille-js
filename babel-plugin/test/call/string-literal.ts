import * as DX from "vasille-web";

const C = DX["compose"](({ a }: { a: number }) => {
  DX.beforeMount(() => (a = 3));
});
