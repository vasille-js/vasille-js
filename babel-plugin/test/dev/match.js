const VasilleFilePath = "babel-plugin-vasille/test/dev/match.ts";
import { component, match as VasilleMatch } from "vasille-web";
const C = component(Vasille => {
  const key = "a";
  const o = {
    [key]: VasilleMatch(key, 2, [VasilleFilePath, 6, 4, 6, 12], Vasille.runner.inspector)
  };
}, [VasilleFilePath, 3, 10, 8, 2], "C");