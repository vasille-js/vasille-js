import { arrayModel, beforeMount, compose, mapModel, ref, setModel } from "vasille-web";

export const C = compose(() => {
  let $a = 3;
  const b = [1, 2, $a];
  const c = new Set([1, 2, $a]);
  const d = new Map([
    [1, $a],
    [2, 3],
  ]);
  const e = {
    f: 1,
    e: 2,
    $g: $a,
  };
  const f = { $a: 1 };
  const g = arrayModel([1]);
  const h = setModel([2]);
  const i = mapModel([[1, [2]]]);
  let $k = ref([1]);
  let $m = ref(new Set([2]));
  let $n = ref(new Map([[1, [2]]]));
  const z = arrayModel();

  beforeMount(() => console.log($a, b[0], c.has($a), d.get(1), e.$g));
  beforeMount(() => console.log(f.$a, g[0], h.has(2), i.get(1), $k[0], $m.has(2), $n.get(1)));
});
