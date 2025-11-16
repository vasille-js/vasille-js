import { compose, ref, bind, calculate, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const $a = ref(2);
  let b = $a.V;
  const $c = bind(Vasille, Vasille_0 => Vasille_0 + b, [$a]);
  const $d = calculate(Vasille, (Vasille_0, Vasille_1) => {
    return Vasille_0 + b + Vasille_1;
  }, [$a, $c]);
  const $e = bind(Vasille, Vasille_0 => Vasille_0 + b, [$a]);
  let f = (() => $a.V + b)();
  // @ts-expect-error
  const $g = ref();
  const $h = ref(3);
  const $j = ref(4);
  VasilleSafe(() => console.log($a.V, b, $c.V, $d.V, $e.V, f, $g.V, $h.V, $j.V))();
});
