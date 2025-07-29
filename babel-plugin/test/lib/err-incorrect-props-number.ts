import { calculate, compose } from "vasille-web";

const C = compose(() => {
  // @ts-expect-error
  const a = calculate((a: number) => {
    return 34;
  });
});
