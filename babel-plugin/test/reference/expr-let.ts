import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = 2;
  let b = 3;
  let c = 4;
  let sum = a + b;

  console.log(sum);

  sum = b;
  sum = b + c;
});
