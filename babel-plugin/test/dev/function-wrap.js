const VasilleFilePath = "babel-plugin-vasille/test/dev/function-wrap.ts";
import { setupPosition as VasilleSetupPosition, runFn as VasilleRun, wrapFn as VasilleWrap } from "steel-frame";
function f1() {
  return VasilleRun(() => {
    console.log(1);
  }, [], [VasilleFilePath, 1, 0, 3, 1]);
}
VasilleSetupPosition(f1, [VasilleFilePath, 1, 0, 3, 1])
function f2(...VasilleArgs) {
  return VasilleRun((a, b) => {
    return a + b;
  }, VasilleArgs, [VasilleFilePath, 5, 0, 7, 1]);
}
VasilleSetupPosition(f2, [VasilleFilePath, 5, 0, 7, 1])
async function f3() {
  return VasilleRun(async () => {
    await new Promise(VasilleWrap(resolve => setTimeout(resolve, 1000), [VasilleFilePath, 10, 20, 10, 56]));
  }, [], [VasilleFilePath, 9, 0, 11, 1]);
}
VasilleSetupPosition(f3, [VasilleFilePath, 9, 0, 11, 1])
const f4 = VasilleWrap(function (a, b) {
  return a + b;
}, [VasilleFilePath, 13, 11, 15, 1]);
const f5 = VasilleWrap((a, b) => a + b, [VasilleFilePath, 17, 11, 17, 42]);
const o1 = {
  v: 1,
  f6(...VasilleArgs) {
    return VasilleRun(a => {
      console.log(a);
    }, VasilleArgs, [VasilleFilePath, 21, 2, 23, 3]);
  },
  f7: VasilleWrap(b => {
    console.log(b);
  }, [VasilleFilePath, 24, 6, 26, 3]),
  f8: VasilleWrap(c => {
    console.log(c);
  }, [VasilleFilePath, 27, 6, 29, 3])
};
class Test {
  m1(...VasilleArgs) {
    return VasilleRun(a => {
      return a + 2;
    }, VasilleArgs, [VasilleFilePath, 33, 2, 35, 3]);
  }
  #m2(...VasilleArgs) {
    return VasilleRun((a, b) => {
      return a + b;
    }, VasilleArgs, [VasilleFilePath, 36, 2, 38, 3]);
  }
  constructor(...VasilleArgs) {
    return VasilleRun(a => {}, VasilleArgs, [VasilleFilePath, 39, 2, 39, 41]);
  }
  get b() {
    return VasilleRun(() => {
      return "b";
    }, [], [VasilleFilePath, 40, 2, 42, 3]);
  }
}
export {};