import { compose, ref, bind, calculate } from "vasille-explicit";

export const C = compose(() => {
  const a = ref(2);
  let b = a.$;
  const c = bind(a.$ + b);
  const d = calculate(() => {
    return a.$ + b + c.$;
  });
  let e = bind(a.$ + b);
  let f = (() => a.$ + b)();

  console.log(a.$, b, c.$, d.$, e.$, f);
});
