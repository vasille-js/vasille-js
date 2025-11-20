import { component } from "vasille-web";

const C = component(() => {
  const o: { a: number; $b?: number } = { a: 1 };
  const $b = o.$b;
});
