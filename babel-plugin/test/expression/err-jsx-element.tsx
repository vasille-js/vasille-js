import { calculate, compose } from "vasille-web";

export const C = compose(() => {
  const c = calculate(() => {
    <div></div>;

    return 0;
  });
});
