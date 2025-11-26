import { compose } from "steel-frame";

const C = compose(() => {
  if (false) {
    throw 1;
  }
});
