import { compose, value, ref, bind, calculate } from "vasille-dx";

export const C = compose(() => {
  let a = ref(2);
  let b = value(a);
  const c = bind(a + b);
  const d = calculate(() => {
    return a + b + c;
  });
  let e = bind(a + b);
  let f = value(calculate(() => a + b));

  console.log(a, b, c, d, e, f);
});
