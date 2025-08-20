import { compose } from "vasille-web";

const C = compose(() => {
  const compose = () => 3;
  const sum = compose() + 2;
});
