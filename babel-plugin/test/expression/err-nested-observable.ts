import { compose, ref } from "vasille-web";

const $obj = ref({
  $nested: ref(2),
});

export const C = compose(() => {
  let $a = 0;
  const $c = $a + $obj.$nested;
});
