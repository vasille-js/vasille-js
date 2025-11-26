import { compose, ref } from "steel-frame";

const $obj = ref({
  $nested: ref(2),
});

const C = compose(() => {
  let $a = 0;
  const $c = $a + $obj.$nested;
});
