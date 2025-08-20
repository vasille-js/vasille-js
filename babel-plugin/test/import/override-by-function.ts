import { beforeMount, compose } from "vasille-web";

const C = compose(() => {
  function compose() {
    return 3;
  }
  beforeMount(() => {
    const sum = compose() + 2;
  });
});
