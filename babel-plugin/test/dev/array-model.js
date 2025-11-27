const VasilleFilePath = "babel-plugin-vasille/test/dev/array-model.ts";
import { arrayModel, component, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const arr = VasilleState(Vasille.id, Vasille.runner, "arr", arrayModel(Vasille.runner.inspector, [VasilleFilePath, 4, 8, 4, 26], Vasille, void 0));
}, [VasilleFilePath, 3, 10, 5, 2], "C");