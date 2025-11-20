const VasilleFilePath = "babel-plugin-vasille/test/dev/map-model.ts";
import { component, mapModel as VasilleMapModel, shareStateById as VasilleState } from "vasille-web";
const C = component(Vasille => {
  const map = VasilleState(Vasille.id, Vasille.runner, "map", VasilleMapModel(Vasille.runner.inspector, Vasille, void 0));
}, [VasilleFilePath, 3, 10, 5, 2], "C");