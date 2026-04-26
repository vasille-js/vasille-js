const VasilleFilePath = "babel-plugin-vasille/test/dev/object.ts";
import { component, ref as VasilleRef } from "steel-frame";
const C = component(Vasille => {
  const o = {
    $a: VasilleRef(1, Vasille, [VasilleFilePath, 5, 4, 5, 9]),
    $b: VasilleRef(2, Vasille, [VasilleFilePath, 6, 4, 6, 9])
  };
}, [VasilleFilePath, 3, 10, 8, 2], "C");