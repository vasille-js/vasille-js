import { beforeMount, component } from "vasille-web";

const C = component(() => {
  const arr = [1, 2];

  beforeMount(() => {
    arr[1] = 3;
  });
});
