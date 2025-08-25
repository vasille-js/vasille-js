import {compose, ref, bind} from "vasille-web";


const C = compose(() => {
  let $a = ref(1);
  let $b = ref(2);
  const $c = bind($a + $b);
  const $d = bind($c);
  const $e = bind(3);
})
