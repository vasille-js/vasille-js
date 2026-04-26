const VasilleFilePath = "babel-plugin-vasille/test/dev/match.ts";
import { component, ref as VasilleRef, match as VasilleMatch } from "steel-frame";
const k = "key";
const C = component((Vasille, {
  ["$data"]: $d = VasilleRef(void 0, null, [VasilleFilePath, 11, 23, 11, 36])
}) => {
  const key = "a";
  const o = {
    [key]: VasilleMatch(key, 2, [VasilleFilePath, 14, 4, 14, 12], Vasille)
  };
}, [VasilleFilePath, 11, 10, 16, 2], "C");