import { calculate, compose } from "vasille-dx";

export const C = compose(() => {
  const c = calculate(() => {
    <div></div>;

    return 0;
  });
});
