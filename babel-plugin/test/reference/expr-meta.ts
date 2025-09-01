import { compose, raw, ref, bind, calculate, beforeMount } from "vasille-web";

const C = compose(() => {
  let $a = ref(2);
  let b = raw($a);
  const $c = bind($a + b);
  const $d = calculate(() => {
    return $a + b + $c;
  });
  let $e = bind($a + b);
  let f = raw((() => $a + b)());
  // @ts-expect-error
  let $g = ref();
  let $h = bind(3);
  const $j = bind(4);

  beforeMount(() => console.log($a, b, $c, $d, $e, f, $g, $h, $j));
});
