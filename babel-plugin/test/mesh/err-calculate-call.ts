import { calculate, compose } from "vasille-web";

const C = compose(() => {
  // @ts-ignore
  const c = calculate(3);
});
