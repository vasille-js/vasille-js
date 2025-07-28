import { compose, value } from "vasille-dx";

const C = compose(() => {
  const a = value(1) + value(2);
});
