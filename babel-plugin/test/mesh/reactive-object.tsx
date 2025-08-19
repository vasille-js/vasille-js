import { bind, compose, store, watch } from "vasille-web";

const obj = { a: 1, b: 2 };

export const S = store(() => {
  let $a = 2;
  let $b = bind(3);
  const o = { a: 1, $b: { c: 3 } };

  console.log(o.$b.c);

  return {
    $a: $a,
    $b: ($b),
    o: o,
  };
});

const s = S;

const Component = compose(() => {
  const $a = s.$a;
  const $b = s.$b;
  const $bc1 = s.o.$b.c;
  const $bc2 = s.o.$b?.c;

  console.log($a, $b, s.o.$b.c, s.o.$b?.c);

  watch(() => {
    console.log($a, $b, s.o.$b.c, s.o.$b?.c);
  });

  <div>
    {$a}
    {$b}
    {s.o.$b.c}
    {s.o.$b?.c}
  </div>;
});
