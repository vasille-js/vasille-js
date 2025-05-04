import { bind, compose, own, ref } from "vasille-explicit";

export const C = compose(() => {
  const a = ref(2);
  const b = ref(3);
  const c = ref(4);
  const sum = own(bind(a.$ + b.$));

  console.log(sum.$);

  sum.$$ = b;
  sum.$$ = c;
});
