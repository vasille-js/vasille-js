import { compose, ref, bind, calculate } from "vasille-web";
export const C = compose(Vasille => {
  const $a = ref(2, "a");
  let b = $a.V;
  const $c = bind(Vasille, Vasille_a => Vasille_a + b, [$a], "c");
  const $d = calculate(Vasille, (Vasille_a, Vasille_c) => {
    return Vasille_a + b + Vasille_c;
  }, [$a, $c], "d");
  const $e = bind(Vasille, Vasille_a => Vasille_a + b, [$a], "e");
  let f = (() => $a.V + b)();
  // @ts-expect-error
  const $g = ref(void 0, "g");
  const $h = ref(3, "h");
  const $j = ref(4, "j");
  console.log($a.V, b, $c.V, $d.V, $e.V, f, $g.V, $h.V, $j.V);
}, "C");
