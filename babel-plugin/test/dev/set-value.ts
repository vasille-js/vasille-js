import { beforeMount, component } from "steel-frame";

const C = component(() => {
  const arr = [1, 2];

  beforeMount(() => {
    arr[1] = 3;
  });
});
