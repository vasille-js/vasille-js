import { compose, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  function compose() {
    return 3;
  }
  VasilleSafe(function () {
    const sum = compose() + 2;
  })();
});
