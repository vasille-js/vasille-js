import { beforeMount, compose } from "vasille-web";

export const C = compose(({ $a = 0 }: { $a: number }) => {
  beforeMount(() => ($a = 3));
});
