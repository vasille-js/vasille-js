import * as DX from "steel-frame";

const C = DX["compose"](({ a }: { a: number }) => {
  DX.beforeMount(() => (a = 3));
});
