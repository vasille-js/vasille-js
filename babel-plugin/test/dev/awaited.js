const VasilleFilePath = "babel-plugin-vasille/test/dev/awaited.ts";
import { awaited, component, shareStateById as VasilleState } from "vasille-web";
const C = component(Vasille => {
  const [$err, $data] = awaited(async () => {
    return 1;
  }, (error, value) => {
    VasilleState(Vasille.id, Vasille.runner, "$err", error);
    VasilleState(Vasille.id, Vasille.runner, "$data", value);
  }, [[VasilleFilePath, 4, 9, 4, 13], [VasilleFilePath, 4, 15, 4, 20]], Vasille.runner.inspector);
}, [VasilleFilePath, 3, 10, 7, 2], "C");