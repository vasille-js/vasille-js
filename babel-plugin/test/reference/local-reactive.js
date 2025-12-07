import { compose, ref, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $arr = ref([{
    $a: ref(1)
  }, {
    $a: ref(2)
  }, {
    $a: ref(3)
  }]);
  const $first = VasilleExpr(Vasille, Vasille_0 => Vasille_0.find(item => item.$a?.V > 1), [$arr]);
});