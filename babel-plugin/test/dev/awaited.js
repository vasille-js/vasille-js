const VasilleFilePath = "babel-plugin-vasille/test/dev/awaited.ts";
import { awaited, component, wrapFn as VasilleWrap } from "steel-frame";
const C = component(Vasille => {
  const [$err, $data] = awaited(VasilleWrap(async () => {
    return 1;
  }, [VasilleFilePath, 4, 32, 6, 3]), [[[VasilleFilePath, 4, 9, 4, 13], "$err"], [[VasilleFilePath, 4, 15, 4, 20], "$data"]], Vasille);
}, [VasilleFilePath, 3, 10, 7, 2], "C");