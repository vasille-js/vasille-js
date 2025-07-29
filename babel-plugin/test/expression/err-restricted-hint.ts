import { compose, value } from "vasille-web";

const C = compose(() => {
  const a = value(1) + value(2);
});
