import { beforeMount, compose } from "steel-frame";

const C = compose(() => {
  function compose() {
    return 3;
  }
  beforeMount(function () {
    const sum = compose() + 2;
  });
});
