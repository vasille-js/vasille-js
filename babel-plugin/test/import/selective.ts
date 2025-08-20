import { beforeMount, compose } from "vasille-web";

const C = compose(({ $a = 0 }: { $a: number }) => {
  beforeMount(() => ($a = 3));
});
