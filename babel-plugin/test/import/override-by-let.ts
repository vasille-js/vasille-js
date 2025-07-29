import { compose } from "vasille-web";

export const C = compose(() => {
  const compose = () => 3;
  const sum = compose() + 2;
});
