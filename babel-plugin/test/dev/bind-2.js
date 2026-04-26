const VasilleFilePath = "babel-plugin-vasille/test/dev/bind-2.ts";
import { bind, component, ref as VasilleRef } from "steel-frame";
const C = component(Vasille => {
  const $a = VasilleRef(1, Vasille, [VasilleFilePath, 4, 6, 4, 12], "$a");
  const $b = bind(Vasille, Vasille_0 => Vasille_0 + 1, [$a], ["$a"], [VasilleFilePath, 5, 8, 5, 25], "$b");
}, [VasilleFilePath, 3, 10, 6, 2], "C");