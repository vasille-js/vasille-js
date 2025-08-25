import { compose, ref, bind, forward as VasilleForward } from "vasille-web";
const C = compose(Vasille => {
  const $a = ref(1, "a");
  const $b = ref(2, "b");
  const $c = bind(Vasille, (Vasille_a, Vasille_b) => Vasille_a + Vasille_b, [$a, $b], "c");
  const $d = VasilleForward(Vasille, $c);
  const $e = ref(3, "e");
}, "C");
