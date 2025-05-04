import { bind, compose, ref } from "vasille-explicit";

export const C = compose(() => {
  const a = ref(2);
  const b = ref(3);
  const sum = bind(a.$ + b.$);

  console.log(sum.$);
});
