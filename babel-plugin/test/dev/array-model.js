const VasilleFilePath = "babel-plugin-vasille/test/dev/array-model.ts";
import { arrayModel, component } from "steel-frame";
const C = component(Vasille => {
  const arr = arrayModel([VasilleFilePath, 4, 8, 4, 26], Vasille, void 0, "arr");
}, [VasilleFilePath, 3, 10, 5, 2], "C");