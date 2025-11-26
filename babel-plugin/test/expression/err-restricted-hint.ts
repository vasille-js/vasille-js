import { compose, calculate, arrayModel } from "steel-frame";

const C = compose(() => {
  const $a = calculate(() => {
    const arr = arrayModel([1]);

    return arr.length;
  });
});
