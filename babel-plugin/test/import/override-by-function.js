import { compose } from "vasille-web";
const C = compose(Vasille => {
  function compose() {
    return 3;
  }
  (function () {
    const sum = compose() + 2;
  })();
}, "C");
