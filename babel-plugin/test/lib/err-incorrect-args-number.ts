import { calculate, compose } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  const a = calculate(() => 23, 45);
});
