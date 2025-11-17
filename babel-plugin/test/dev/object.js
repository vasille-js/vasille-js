const VasilleFilePath = "babel-plugin-vasille/test/dev/object.ts";
import { component, ref as VasilleRef } from "vasille-web";
const C = component(Vasille => {
  const o = {
    $a: VasilleRef(1, [VasilleFilePath, 5, 4, 5, 9], Vasille.runner.inspector),
    $b: VasilleRef(2, [VasilleFilePath, 6, 4, 6, 9], Vasille.runner.inspector)
  };
}, [VasilleFilePath, 3, 10, 8, 2], "C");