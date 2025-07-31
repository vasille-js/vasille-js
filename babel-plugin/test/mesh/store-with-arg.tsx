import { store } from "vasille-web";

const S = store(({ a }: { a: number }) => {
  let b = a;
  const c = a + b;

  return {
    $a: a,
    $b: b,
    $c: c,
  };
});
