import * as Web from "steel-frame";

const $a = Web.ref(2);

const C = Web.compose(() => {
  function overrideTest() {
    const Web = {
      ref(x) {
        return x;
      },
    };
    const xx = Web.ref(2);
  }

  Web.beforeMount(() => Web.router());
});
