import { component } from "steel-frame";

const C = component(() => {
  const o: { a: number; $b?: number } = { a: 1 };
  const $b = o.$b;
});
