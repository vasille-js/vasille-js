const VasilleFilePath = "babel-plugin-vasille/test/dev/ref-no-args.ts";
import { component, ref } from "steel-frame";
const C = component(Vasille => {
  // @ts-expect-error
  const $none = ref(void 0, Vasille, [VasilleFilePath, 5, 8, 5, 21], "$none");
}, [VasilleFilePath, 3, 10, 6, 2], "C");