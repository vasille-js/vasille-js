const VasilleFilePath = "babel-plugin-vasille/test/dev/calculate.ts";
import { calculate, component, ref as VasilleRef, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleState(Vasille.id, Vasille.runner, "$a", VasilleRef(1, [VasilleFilePath, 4, 6, 4, 12], Vasille.runner.inspector));
  const $b = VasilleState(Vasille.id, Vasille.runner, "$b", calculate(Vasille, Vasille_0 => {
    return Vasille_0 + 1;
  }, [$a], ["$a"], [VasilleFilePath, 5, 8, 7, 4], Vasille.runner.inspector));
}, [VasilleFilePath, 3, 10, 8, 2], "C");