const VasilleFilePath = "babel-plugin-vasille/test/dev/awaited-2.ts";
import { awaited, component, shareStateById as VasilleState } from "vasille-web";
const C = component(Vasille => {
  const [] = awaited(async () => {
    return 1;
  }, (error, value) => {
    VasilleState(Vasille.id, Vasille.runner, "#", error);
    VasilleState(Vasille.id, Vasille.runner, "#", value);
  }, [[VasilleFilePath, 4, 8, 4, 10], [VasilleFilePath, 4, 8, 4, 10]], Vasille.runner.inspector);
}, [VasilleFilePath, 3, 10, 7, 2], "C");