const VasilleFilePath = "babel-plugin-vasille/test/dev/calculate-2.tsx";
import { calculate, ref } from "vasille-web";
let $a = ref(1);
const {
  $b
} = calculate(null, Vasille_0 => {
  return {
    $b: Vasille_0 + 1
  };
}, [$a], [$a], [VasilleFilePath, 4, 6, 6, 2], Vasille.runner.inspector);