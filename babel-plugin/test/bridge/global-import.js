import * as Web from "vasille-web";
const a = Web.$.r(2);
const C = Web.compose(Vasille => {
  Vasille.runner.router;
  function overrideTest() {
    const Web = {
      bridge: {
        ref(x) {
          return x;
        }
      }
    };
    const xx = Web.bridge.ref(2);
  }
}, "VasilleWeb:C");
