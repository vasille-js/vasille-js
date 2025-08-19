import * as DX from "vasille-web";

export const C = DX.compose(({ $a }: { $a: number }) => {
  DX.beforeMount(() => $a = 3);
});
