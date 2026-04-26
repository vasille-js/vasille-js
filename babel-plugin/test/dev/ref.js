const VasilleFilePath = "babel-plugin-vasille/test/dev/ref.ts";
import { component, ref as VasilleRef } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleRef(1, Vasille, [VasilleFilePath, 4, 6, 4, 12], "$a");
}, [VasilleFilePath, 3, 10, 5, 2], "C");