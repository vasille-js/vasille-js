const VasilleFilePath = "babel-plugin-vasille/test/dev/calculate-2.tsx";
import { calculate, ref } from "steel-frame";
let $a = ref(1, null, [VasilleFilePath, 3, 4, 3, 15]);
const {
  $b
} = calculate(null, Vasille_0 => {
  return {
    $b: Vasille_0 + 1
  };
}, [$a], ["$a"], [VasilleFilePath, 4, 6, 6, 2]);