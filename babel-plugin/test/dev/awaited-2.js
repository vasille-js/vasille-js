const VasilleFilePath = "babel-plugin-vasille/test/dev/awaited-2.ts";
import { awaited, component, wrapFn as VasilleWrap, shareStateById as VasilleState } from "steel-frame";
const C = component(Vasille => {
  const [] = awaited(VasilleWrap(async () => {
    return 1;
  }, [VasilleFilePath, 4, 21, 6, 3], Vasille.runner.inspector), (error, value) => {
    VasilleState(Vasille.id, Vasille.runner, "#", error);
    VasilleState(Vasille.id, Vasille.runner, "#", value);
  }, [[VasilleFilePath, 4, 8, 4, 10], [VasilleFilePath, 4, 8, 4, 10]], Vasille.runner.inspector);
}, [VasilleFilePath, 3, 10, 7, 2], "C");