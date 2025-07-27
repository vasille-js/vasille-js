import { arrayModel, calculate, compose, ref, state, watch } from "vasille-dx";

export const C = state(() => {
  let a = 2;
  let b = 2;
  const c = calculate(() => a + b);
  let d = c;
  const e = [1, 2];
  const f = new Set([1, 2]);
  const g = new Map([[1, 2]]);
  const h = { a: 1 };
  let i = a + b;
  const j = arrayModel();
  const k = a + b;
  const o = ref({ a: { b: 1 } });

  return {
    $a: a,
    $b: b,
    $c: c,
    $d: d,
    e: e,
    f: f,
    g: g,
    $$h: h,
    $i: i,
    j: j,
    $k: k,
    $o: o,
  };
});

const c = C();

const Component = compose(() => {
  console.log(c.$a, c.$b, c.$c, c.$d, c.e, c.f, c.g, c.$$h.a, c.$i, c.j, c.$k, c.$o.a.b);

  watch(() => {
    console.log(c.$a, c.$b, c.$c, c.$d);
    console.log(c.e, c.f, c.g);
    console.log(c.$$h.a, c.$i, c.j);
    console.log(c.$k, c.$o.a.b);
  });

  <div>
    {c.$a}
    {c.$b}
    {c.$c}
    {c.$d}
    {c.e}
    {c.f}
    {c.g}
    {c.$$h.a}
    {c.$i}
    {c.j}
    {c.$k}
    {c.$o.a.b}
  </div>;
});
