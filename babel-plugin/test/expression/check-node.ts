import { compose, ref } from "vasille-web";

const o = { $a: ref(2) };

const C = compose(() => {
  const o1 = { a: 1 };
  const $c1 = o.$a;
  const c2 = o1.a;
  const $s = $c1 + c2;
});
