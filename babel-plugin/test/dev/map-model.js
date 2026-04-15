const VasilleFilePath = "babel-plugin-vasille/test/dev/map-model.ts";
import { component, mapModel, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const map = VasilleState(Vasille.id, Vasille.runner, "map", mapModel(Vasille.runner.inspector, [VasilleFilePath, 4, 8, 4, 24], Vasille, void 0));
}, [VasilleFilePath, 3, 10, 5, 2], "C");