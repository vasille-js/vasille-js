const VasilleFilePath = "babel-plugin-vasille/test/dev/ref-no-args.ts";
import { component, ref, shareStateById as VasilleState } from "vasille-web";
const C = component(Vasille => {
  // @ts-expect-error
  const $none = VasilleState(Vasille.id, Vasille.runner, "$none", ref(void 0, [VasilleFilePath, 5, 8, 5, 21], Vasille.runner.inspector));
}, [VasilleFilePath, 3, 10, 6, 2], "C");