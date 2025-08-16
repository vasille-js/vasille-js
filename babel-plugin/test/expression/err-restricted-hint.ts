import { compose, calculate, arrayModel } from "vasille-web";

const C = compose(() => {
  const $a = calculate(() => {
    const arr = arrayModel([1]);

    return arr.length;
  });
});
