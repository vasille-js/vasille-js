const VasilleFilePath = "babel-plugin-vasille/test/dev/set-model.ts";
import { component, setModel, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const set = VasilleState(Vasille.id, Vasille.runner, "set", setModel(Vasille.runner.inspector, [VasilleFilePath, 4, 8, 4, 24], Vasille, void 0));
}, [VasilleFilePath, 3, 10, 5, 2], "C");