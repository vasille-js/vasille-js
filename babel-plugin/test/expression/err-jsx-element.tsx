import { calculate, compose } from "steel-frame";

const C = compose(() => {
  const c = calculate(() => {
    <div></div>;

    return 0;
  });
});
