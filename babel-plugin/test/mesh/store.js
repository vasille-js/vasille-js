import { arrayModel, bind, calculate, compose, mapModel, ref, setModel, store, watch } from "vasille-web";
const cStore = store(Vasille => {
  const $a = ref(2, "a");
  const $b = ref(2, "b");
  const $c = calculate(Vasille, (Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [$a, $b], "c");
  const $d = ref($c.V, "d");
  const e = arrayModel(Vasille, [1, 2], "e");
  const f = setModel(Vasille, [1, 2], "f");
  const g = mapModel(Vasille, [[1, 2]], "g");
  const h = {
    a: 1
  };
  const $i = ref($a.V + $b.V, "i");
  const j = arrayModel(Vasille, void 0, "j");
  const $k = watch(Vasille, (Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [$a, $b], "k");
  const $o = ref({
    a: {
      b: 1
    }
  }, "o");
  const $m = bind(Vasille, (Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [$a, $b], "m");
  const $n = ref(2, "n");
  const p = 3;
  const q = arrayModel(Vasille, void 0, "q");
  const r = setModel(Vasille, void 0, "r");
  const s = mapModel(Vasille, void 0, "s");
  const t = {};
  watch(Vasille, Vasille_o => {
    console.log(Vasille_o);
  }, [$o]);
  return {
    $a: $a,
    $b: $b,
    $c: $c,
    $d: $d,
    e: e,
    f: f,
    ["g"]: g,
    ["$$h"]: ref(h),
    $i: $i,
    j: j,
    $k: $k,
    $o: $o
  };
}, "cStore");
const c = cStore;
const Component = compose(Vasille => {
  watch(Vasille, (Vasille_c_a, Vasille_c_b, Vasille_c_c, Vasille_c_d, Vasille_c_$h, Vasille_c_i, Vasille_c_k, Vasille_c_o) => {
    console.log(Vasille_c_a, Vasille_c_b, Vasille_c_c, Vasille_c_d);
    console.log(c.e, c.f, c.g);
    console.log(Vasille_c_$h.a, Vasille_c_i, c.j);
    console.log(Vasille_c_k, Vasille_c_o.a.b);
  }, [c.$a, c.$b, c.$c, c.$d, c.$$h, c.$i, c.$k, c.$o]);
  console.log(c["$a"]?.V, c.$b?.V, c.$c?.V, c.$d?.V, c.e, c.f, c.g, c["$$h"].V.a, c.$i?.V, c.j, c.$k?.V, c.$o.V.a.b);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(c.$a);
    Vasille.text(c.$b);
    Vasille.text(c.$c);
    Vasille.text(c.$d);
    Vasille.text(c.e);
    Vasille.text(c.f);
    Vasille.text(c.g);
    Vasille.text(watch(Vasille, Vasille_c_$h => Vasille_c_$h.a, [c.$$h]));
    Vasille.text(c.$i);
    Vasille.text(c.j);
    Vasille.text(c.$k);
    Vasille.text(watch(Vasille, Vasille_c_o => Vasille_c_o.a.b, [c.$o]));
  });
}, "Component");
