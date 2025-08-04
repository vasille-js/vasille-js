import * as Web from "vasille-web";

const a = Web.bridge.ref(2);

const C = Web.compose(() => {
  Web.router();

  function overrideTest() {
    const Web = {
      bridge: {
        ref(x) {
          return x;
        },
      },
    };
    const xx = Web.bridge.ref(2);
  }
});
