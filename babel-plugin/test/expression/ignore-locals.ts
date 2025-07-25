import { compose, watch } from "vasille-dx";

export const C = compose(() => {
  let a = 0;
  let b = 1;
  let c = 2;
  let d = 4;
  let e = 5;

  watch(() => {
    const a = 1;
    const { b, c = 2, ...d } = { b: 3 };
    const [e] = [1];

    // all variables must be ignored
    console.log(a, b, c, d, e);
  });
});
