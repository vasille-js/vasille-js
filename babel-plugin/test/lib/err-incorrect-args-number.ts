import { calculate, compose } from "vasille-dx";

const C = compose(() => {
  // @ts-expect-error
  const a = calculate(() => 23, 45);
});
