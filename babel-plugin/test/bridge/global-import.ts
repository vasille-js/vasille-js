import * as Web from "vasille-web";

const $a = Web.ref(2);

const C = Web.compose(() => {
  Web.router();

  function overrideTest() {
    const Web = {
      ref(x) {
        return x;
      },
    };
    const xx = Web.ref(2);
  }
});
