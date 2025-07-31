import { store } from "vasille-web";

const S = store(({ a }: { a: number }) => {
  let b = a;
  const c = a + b;
  let d = "static";

  return {
    $a: a,
    $b: b,
    $c: c,
    dispatchB(newB: number) {
      b = newB;
    },
    dispatchD(newD: string) {
      d = newD;
    },
  };
});
