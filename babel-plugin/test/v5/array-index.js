import { bind, calculate, compose, ref, match as VasilleMatch } from "vasille-web";
const C = compose(Vasille => {
  const $arr = ref([1, 2, 3]);
  const $index = ref(0);
  const $implicit = calculate(Vasille, (Vasille_0, Vasille_1) => Vasille_0[Vasille_1], [$arr, $index]);
  const $explicit = bind(Vasille, (Vasille_0, Vasille_1) => Vasille_0[Vasille_1], [$arr, $index]);
  const $computed = calculate(Vasille, (Vasille_0, Vasille_1) => {
    return Vasille_0[Vasille_1];
  }, [$arr, $index]);
  const unwrapped = VasilleMatch("", $arr.V[$index.V]);
});