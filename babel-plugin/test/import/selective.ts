import { beforeMount, compose } from "steel-frame";

const C = compose(({ $a = 0 }: { $a: number }) => {
  beforeMount(() => ($a = 3));
});
