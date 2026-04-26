const VasilleFilePath = "babel-plugin-vasille/test/dev/awaited-2.ts";
import { awaited, component, wrapFn as VasilleWrap } from "steel-frame";
const C = component(Vasille => {
  const [] = awaited(VasilleWrap(async () => {
    return 1;
  }, [VasilleFilePath, 4, 21, 6, 3]), [[[VasilleFilePath, 4, 8, 4, 10], "#"], [[VasilleFilePath, 4, 8, 4, 10], "#"]], Vasille);
}, [VasilleFilePath, 3, 10, 7, 2], "C");