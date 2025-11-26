const VasilleFilePath = "babel-plugin-vasille/test/dev/function-wrap.ts";
import { earlyInspector as VasilleInspector, runFn as VasilleRun, wrapFn as VasilleWrap } from "steel-frame";
function f1(...VasilleArgs) {
  return VasilleRun(() => {
    console.log(1);
  }, VasilleArgs, [VasilleFilePath, 1, 0, 3, 1], VasilleInspector);
}
function f2(...VasilleArgs) {
  return VasilleRun((a, b) => {
    return a + b;
  }, VasilleArgs, [VasilleFilePath, 5, 0, 7, 1], VasilleInspector);
}
async function f3(...VasilleArgs) {
  return VasilleRun(async () => {
    await new Promise(VasilleWrap(resolve => setTimeout(resolve, 1000), [VasilleFilePath, 10, 20, 10, 56], VasilleInspector));
  }, VasilleArgs, [VasilleFilePath, 9, 0, 11, 1], VasilleInspector);
}
const f4 = VasilleWrap(function (a, b) {
  return a + b;
}, [VasilleFilePath, 13, 11, 15, 1], VasilleInspector);
const f5 = VasilleWrap((a, b) => a + b, [VasilleFilePath, 17, 11, 17, 42], VasilleInspector);
const o1 = {
  v: 1,
  f6(...VasilleArgs) {
    return VasilleRun(a => {
      console.log(a);
    }, VasilleArgs, [VasilleFilePath, 21, 2, 23, 3], VasilleInspector);
  },
  f7: VasilleWrap(b => {
    console.log(b);
  }, [VasilleFilePath, 24, 6, 26, 3], VasilleInspector),
  f8: VasilleWrap(c => {
    console.log(c);
  }, [VasilleFilePath, 27, 6, 29, 3], VasilleInspector)
};
class Test {
  m1(...VasilleArgs) {
    return VasilleRun(a => {
      return a + 2;
    }, VasilleArgs, [VasilleFilePath, 33, 2, 35, 3], VasilleInspector);
  }
  #m2(...VasilleArgs) {
    return VasilleRun((a, b) => {
      return a + b;
    }, VasilleArgs, [VasilleFilePath, 36, 2, 38, 3], VasilleInspector);
  }
  constructor(...VasilleArgs) {
    return VasilleRun(a => {}, VasilleArgs, [VasilleFilePath, 39, 2, 39, 41], VasilleInspector);
  }
}
export {};