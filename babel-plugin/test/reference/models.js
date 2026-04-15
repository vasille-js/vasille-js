import { arrayModel, compose, mapModel, ref, setModel, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const $a = ref(3);
  const b = [1, 2, $a.V];
  const c = new Set([1, 2, $a.V]);
  const d = new Map([[1, $a.V], [2, 3]]);
  const e = {
    f: 1,
    e: 2,
    $g: $a
  };
  const f = {
    $a: ref(1)
  };
  const g = arrayModel(Vasille, [1]);
  const h = setModel(Vasille, [2]);
  const i = mapModel(Vasille, [[1, [2]]]);
  const $k = ref([1]);
  const $m = ref(new Set([2]));
  const $n = ref(new Map([[1, [2]]]));
  const z = arrayModel(Vasille);
  VasilleSafe(() => console.log($a.V, b[0], c.has($a.V), d.get(1), e.$g.V))();
  VasilleSafe(() => console.log(f.$a.V, g[0], h.has(2), i.get(1), $k.V[0], $m.V.has(2), $n.V.get(1)))();
});
