const VasilleFilePath = "babel-plugin-vasille/test/dev/set-value.ts";
import { component, arrayModel as VasilleArrayModel, shareStateById as VasilleState, executionPosition as VasilleExePos, set as VasilleSet, wrapFn as VasilleWrap, safe as VasilleSafe } from "steel-frame";
const C = component(Vasille => {
  const arr = VasilleState(Vasille.id, Vasille.runner, "arr", VasilleArrayModel(Vasille.runner.inspector, Vasille, [1, 2]));
  VasilleSafe(VasilleWrap(() => {
    VasilleSet(arr, 1, 3, [VasilleFilePath, 7, 4, 7, 14], Vasille.runner.inspector, VasilleExePos(Vasille.runner.inspector, [VasilleFilePath, 7, 4, 7, 14], new Error("execution-position")));
  }, [VasilleFilePath, 6, 14, 8, 3], Vasille.runner.inspector))();
}, [VasilleFilePath, 3, 10, 9, 2], "C");