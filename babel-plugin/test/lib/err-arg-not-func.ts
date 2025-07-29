import { calculate, compose } from "vasille-web";

const C = compose(() => {
  // @ts-expect-error
  const a = calculate(34);
});
