import { arrayModel, beforeMount, component } from "steel-frame";

const C = component(() => {
  const arr = arrayModel([1, 2]);

  beforeMount(() => {
    arr[1] = 3;
  });
});
