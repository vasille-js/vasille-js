const VasilleFilePath = "babel-plugin-vasille/test/dev/page.ts";
import { page, ref as VasilleRef, shareStateById as VasilleState } from "steel-frame";
export default page(async Vasille => {
  const $a = VasilleState(Vasille.id, Vasille.runner, "$a", VasilleRef(1, [VasilleFilePath, 4, 6, 4, 12], Vasille.runner.inspector));
}, [VasilleFilePath, 3, 15, 5, 2], "#");