import { compose } from "steel-frame";

const C = compose(() => {
  const compose = () => 3;
  const sum = compose() + 2;
});
