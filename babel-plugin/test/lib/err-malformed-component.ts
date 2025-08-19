import { compose } from "vasille-web";

const C = compose(() => {
  if (false) {
    throw 1;
  }
})