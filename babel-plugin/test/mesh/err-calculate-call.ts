import { calculate, compose } from "steel-frame";

const C = compose(() => {
  // @ts-ignore
  const c = calculate(3);
});
