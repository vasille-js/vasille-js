import { arrayModel, compose, mapModel, ref, setModel, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const $a = ref(3, "a");
  const b = arrayModel(Vasille, [1, 2, $a.V], "b");
  const c = setModel(Vasille, [1, 2, $a.V], "c");
  const d = mapModel(Vasille, [[1, $a.V], [2, 3]], "d");
  const e = {
    f: 1,
    e: 2,
    $g: $a
  };
  const f = {
    $a: ref(1)
  };
  const g = arrayModel(Vasille, [1], "g");
  const h = setModel(Vasille, [2], "h");
  const i = mapModel(Vasille, [[1, [2]]], "i");
  const $k = ref([1], "k");
  const $m = ref(new Set([2]), "m");
  const $n = ref(new Map([[1, [2]]]), "n");
  const z = arrayModel(Vasille, void 0, "z");
  VasilleSafe(() => console.log($a.V, b[0], c.has($a.V), d.get(1), e.$g.V))();
  VasilleSafe(() => console.log(f.$a.V, g[0], h.has(2), i.get(1), $k.V[0], $m.V.has(2), $n.V.get(1)))();
}, "C");
