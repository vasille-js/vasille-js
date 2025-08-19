import { beforeMount, compose } from "vasille-web";

export const C = compose(() => {
  function compose() {
    return 3;
  }
  beforeMount(() => {
    const sum = compose() + 2;
  });
});
