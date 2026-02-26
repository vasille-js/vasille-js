const VasilleFilePath = "babel-plugin-vasille/test/dev/ensure.ts";
import { component, ensure as VasilleEnsure } from "steel-frame";
const C = component(Vasille => {
  const o = {
    a: 1
  };
  const $b = VasilleEnsure(o, "$b", [VasilleFilePath, 5, 8, 5, 17], Vasille.runner.inspector);
  const $x = VasilleEnsure(o, "$b", [VasilleFilePath, 6, 8, 6, 20], Vasille.runner.inspector);
}, [VasilleFilePath, 3, 10, 7, 2], "C");