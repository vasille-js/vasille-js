import { bind, compose, forward, state, watch } from "vasille-dx";

const obj = { a: 1, b: 2 };

export const S = state(() => {
  let a = 2;
  let b = bind(3);
  const o = { a: 1, b: { c: 3 } };

  return {
    $a: a,
    $b: forward(b),
    $$o: o,
  };
});

const s = S();

const Component = compose(() => {
  const a = s.$a;
  const b = s.$b;
  const o0 = s["$$o"];
  const o1 = s.$$o;
  const o2 = obj;

  console.log(a, b, o0.b.c, o1.a, o2.a);

  watch(() => {
    console.log(a, b, o0.b.c, o1.a, o2.a);
  });

  <div>
    {a}
    {b}
    {o0.b.c}
    {o1.a}
    {o2.a}
  </div>;
});
