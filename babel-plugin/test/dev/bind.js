const VasilleFilePath = "babel-plugin-vasille/test/dev/bind.ts";
import { component, ref as VasilleRef, expr as VasilleExpr } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleRef(1, Vasille, [VasilleFilePath, 4, 6, 4, 12], "$a");
  const $b = VasilleExpr(Vasille, Vasille_0 => Vasille_0 + 1, [$a], ["$a"], [VasilleFilePath, 5, 13, 5, 19], "$b");
}, [VasilleFilePath, 3, 10, 6, 2], "C");