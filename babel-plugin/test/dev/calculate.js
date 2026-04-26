const VasilleFilePath = "babel-plugin-vasille/test/dev/calculate.ts";
import { calculate, component, ref as VasilleRef } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleRef(1, Vasille, [VasilleFilePath, 4, 6, 4, 12], "$a");
  const $b = calculate(Vasille, Vasille_0 => {
    return Vasille_0 + 1;
  }, [$a], ["$a"], [VasilleFilePath, 5, 8, 7, 4], "$b");
}, [VasilleFilePath, 3, 10, 8, 2], "C");