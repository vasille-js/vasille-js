const VasilleFilePath = "babel-plugin-vasille/test/dev/awaited.ts";
import { awaited, component, wrapFn as VasilleWrap, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const [$err, $data] = awaited(VasilleWrap(async () => {
    return 1;
  }, [VasilleFilePath, 4, 32, 6, 3], Vasille.runner.inspector), (error, value) => {
    VasilleState(Vasille.id, Vasille.runner, "$err", error);
    VasilleState(Vasille.id, Vasille.runner, "$data", value);
  }, [[VasilleFilePath, 4, 9, 4, 13], [VasilleFilePath, 4, 15, 4, 20]], Vasille.runner.inspector);
}, [VasilleFilePath, 3, 10, 7, 2], "C");