import { bind, compose, store, watch } from "vasille-web";

const obj = { a: 1, b: 2 };

export const S = store(() => {
  let $a = 2;
  let $b = bind(3);
  const o = { a: 1, b: { c: 3 } };
  const { b: b0, ...o0 } = o;

  console.log(b0, o0.a);

  return {
    $a: $a,
    $b: ($b),
    o: o,
    $b0: b0,
    o0: o0,
  };
});

const s = S;

const Component = compose(() => {
  const $a = s.$a;
  const $b = s.$b;
  const o0 = s["o"];
  const o1 = s.o;
  const o2 = obj;

  console.log($a, $b, o0.b.c, o1.a, o2.a);

  watch(() => {
    console.log($a, $b, o0.b.c, o1.a, o2.a);
  });

  <div>
    {$a}
    {$b}
    {o0.b.c}
    {o1.a}
    {o2.a}
  </div>;
});
