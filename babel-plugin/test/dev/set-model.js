const VasilleFilePath = "babel-plugin-vasille/test/dev/set-model.ts";
import { component, setModel } from "steel-frame";
const C = component(Vasille => {
  const set = setModel([VasilleFilePath, 4, 8, 4, 24], Vasille, void 0, "set");
}, [VasilleFilePath, 3, 10, 5, 2], "C");