const VasilleFilePath = "babel-plugin-vasille/test/dev/bind.ts";
import { component, ref as VasilleRef, shareStateById as VasilleState, expr as VasilleExpr } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleState(Vasille.id, Vasille.runner, "$a", VasilleRef(1, [VasilleFilePath, 4, 6, 4, 12], Vasille.runner.inspector));
  const $b = VasilleState(Vasille.id, Vasille.runner, "$b", VasilleExpr(Vasille, Vasille_0 => Vasille_0 + 1, [$a], ["$a"], [VasilleFilePath, 5, 13, 5, 19], Vasille.runner.inspector));
}, [VasilleFilePath, 3, 10, 6, 2], "C");