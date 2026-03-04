const VasilleFilePath = "babel-plugin-vasille/test/dev/calculate-2.tsx";
import { calculate, ref, earlyInspector as VasilleInspector } from "steel-frame";
let $a = ref(1, [VasilleFilePath, 3, 4, 3, 15], VasilleInspector);
const {
  $b
} = calculate(null, Vasille_0 => {
  return {
    $b: Vasille_0 + 1
  };
}, [$a], ["$a"], [VasilleFilePath, 4, 6, 6, 2], VasilleInspector);