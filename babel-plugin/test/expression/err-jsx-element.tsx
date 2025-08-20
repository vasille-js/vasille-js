import { calculate, compose } from "vasille-web";

const C = compose(() => {
  const c = calculate(() => {
    <div></div>;

    return 0;
  });
});
