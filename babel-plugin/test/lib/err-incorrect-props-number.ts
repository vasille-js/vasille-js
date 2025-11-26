import { calculate, compose } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  const a = calculate((a: number) => {
    return 34;
  });
});
