import { compose, ref, watch } from "vasille-explicit";

export const C = compose(() => {
  const a = 3;
  const b = ref(4);
  const c = ref(5);

  watch(() => {
    c.$ = a + b.$;
  });
});
