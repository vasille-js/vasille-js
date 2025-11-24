const VasilleFilePath = "babel-plugin-vasille/test/dev/value-assignment.ts";
import { component, ref, shareStateById as VasilleState, executionPosition as VasilleExePos, runFn as VasilleRun, earlyInspector as VasilleInspector } from "vasille-web";
const C = component(Vasille => {
  const $a = VasilleState(Vasille.id, Vasille.runner, "$a", ref(1, [VasilleFilePath, 4, 6, 4, 12], Vasille.runner.inspector));
  const o = {
    $a: ref(1, [VasilleFilePath, 5, 14, 5, 19], Vasille.runner.inspector),
    c: 2
  };
  function update(...VasilleArgs) {
    return VasilleRun(a => {
      $a.update(a, VasilleExePos(Vasille.runner.inspector, [VasilleFilePath, 8, 4, 8, 10], new Error("execution-position")));
      o.$a.update(a, VasilleExePos(Vasille.runner.inspector, [VasilleFilePath, 9, 4, 9, 12], new Error("execution-position")));
      o.c = 3;
    }, VasilleArgs, [VasilleFilePath, 7, 2, 11, 3], Vasille.runner.inspector);
  }
}, [VasilleFilePath, 3, 10, 12, 2], "C");
let $b = ref(1, [VasilleFilePath, 14, 4, 14, 15], VasilleInspector);
const obj = {
  $r: ref(1, [VasilleFilePath, 16, 2, 16, 12], VasilleInspector),
  x: 2
};
function update1(...VasilleArgs) {
  return VasilleRun(a => {
    $b.update(a, VasilleExePos(VasilleInspector, [VasilleFilePath, 21, 2, 21, 8], new Error("execution-position")));
    obj.$r.update(2, VasilleExePos(VasilleInspector, [VasilleFilePath, 22, 2, 22, 12], new Error("execution-position")));
    obj.x = 3;
  }, VasilleArgs, [VasilleFilePath, 20, 0, 24, 1], VasilleInspector);
}