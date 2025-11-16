import { compose, ref, bind } from "vasille-web";
const C = compose(Vasille => {
  const $a = ref(1);
  const $b = ref(2);
  const $c = bind(Vasille, (Vasille_0, Vasille_1) => Vasille_0 + Vasille_1, [$a, $b]);
  const $d = $c;
  const $e = ref(3);
});
