const VasilleFilePath = "babel-plugin-vasille/test/dev/map-model.ts";
import { component, mapModel } from "steel-frame";
const C = component(Vasille => {
  const map = mapModel([VasilleFilePath, 4, 8, 4, 24], Vasille, void 0, "map");
}, [VasilleFilePath, 3, 10, 5, 2], "C");