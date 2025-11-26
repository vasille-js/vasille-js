const VasilleFilePath = "babel-plugin-vasille/test/dev/ref.ts";
import { component, ref as VasilleRef, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleState(Vasille.id, Vasille.runner, "$a", VasilleRef(1, [VasilleFilePath, 4, 6, 4, 12], Vasille.runner.inspector));
}, [VasilleFilePath, 3, 10, 5, 2], "C");