const VasilleFilePath = "babel-plugin-vasille/test/dev/set-value.ts";
import { arrayModel, component, executionPosition as VasilleExePos, set as VasilleSet, wrapFn as VasilleWrap, safe as VasilleSafe } from "steel-frame";
const C = component(Vasille => {
  const arr = arrayModel([VasilleFilePath, 4, 8, 4, 32], Vasille, [1, 2], "arr");
  VasilleSafe(VasilleWrap(() => {
    VasilleSet(arr, 1, 3, Vasille, [VasilleFilePath, 7, 4, 7, 14], VasilleExePos([VasilleFilePath, 7, 4, 7, 14], new Error("execution-position")));
  }, [VasilleFilePath, 6, 14, 8, 3]))();
}, [VasilleFilePath, 3, 10, 9, 2], "C");