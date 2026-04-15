const VasilleFilePath = "babel-plugin-vasille/test/dev/set-value.ts";
import { arrayModel, component, shareStateById as VasilleState, executionPosition as VasilleExePos, set as VasilleSet, wrapFn as VasilleWrap, safe as VasilleSafe } from "steel-frame";
const C = component(Vasille => {
  const arr = VasilleState(Vasille.id, Vasille.runner, "arr", arrayModel(Vasille.runner.inspector, [VasilleFilePath, 4, 8, 4, 32], Vasille, [1, 2]));
  VasilleSafe(VasilleWrap(() => {
    VasilleSet(arr, 1, 3, [VasilleFilePath, 7, 4, 7, 14], Vasille.runner.inspector, VasilleExePos(Vasille.runner.inspector, [VasilleFilePath, 7, 4, 7, 14], new Error("execution-position")));
  }, [VasilleFilePath, 6, 14, 8, 3], Vasille.runner.inspector))();
}, [VasilleFilePath, 3, 10, 9, 2], "C");