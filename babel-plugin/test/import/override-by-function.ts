import { compose } from "vasille-web";

export const C = compose(() => {
  function compose() {
    return 3;
  }
  const sum = compose() + 2;
});
