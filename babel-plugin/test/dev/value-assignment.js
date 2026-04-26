const VasilleFilePath = "babel-plugin-vasille/test/dev/value-assignment.ts";
import { component, ref, setupPosition as VasilleSetupPosition, executionPosition as VasilleExePos, runFn as VasilleRun } from "steel-frame";
const C = component(Vasille => {
  const $a = ref(1, Vasille, [VasilleFilePath, 4, 6, 4, 12], "$a");
  const o = {
    $a: ref(1, Vasille, [VasilleFilePath, 5, 14, 5, 19]),
    c: 2
  };
  function update(...VasilleArgs) {
    return VasilleRun(a => {
      $a.update(a, VasilleExePos([VasilleFilePath, 8, 4, 8, 10], new Error("execution-position")));
      o.$a.update(a, VasilleExePos([VasilleFilePath, 9, 4, 9, 12], new Error("execution-position")));
      o.c = 3;
    }, VasilleArgs, [VasilleFilePath, 7, 2, 11, 3]);
  }
  VasilleSetupPosition(update, [VasilleFilePath, 7, 2, 11, 3])
}, [VasilleFilePath, 3, 10, 12, 2], "C");
let $b = ref(1, null, [VasilleFilePath, 14, 4, 14, 15]);
const obj = {
  $r: ref(1, null, [VasilleFilePath, 16, 2, 16, 12]),
  x: 2
};
function update1(...VasilleArgs) {
  return VasilleRun(a => {
    $b.update(a, VasilleExePos([VasilleFilePath, 21, 2, 21, 8], new Error("execution-position")));
    obj.$r.update(2, VasilleExePos([VasilleFilePath, 22, 2, 22, 12], new Error("execution-position")));
    obj.x = 3;
  }, VasilleArgs, [VasilleFilePath, 20, 0, 24, 1]);
}
VasilleSetupPosition(update1, [VasilleFilePath, 20, 0, 24, 1])