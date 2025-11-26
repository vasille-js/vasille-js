const VasilleFilePath = "babel-plugin-vasille/test/dev/ensure.ts";
import { component, ensure as VasilleEnsure } from "steel-frame";
const C = component(Vasille => {
  const o = {
    a: 1
  };
  const $b = VasilleEnsure(o.$b, [VasilleFilePath, 5, 8, 5, 17], Vasille.runner.inspector);
}, [VasilleFilePath, 3, 10, 6, 2], "C");