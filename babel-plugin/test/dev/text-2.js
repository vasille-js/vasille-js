const VasilleFilePath = "babel-plugin-vasille/test/dev/text-2.tsx";
import { component, ref as VasilleRef, shareStateById as VasilleState, positionedText as VasillePosText } from "steel-frame";
const C = component(Vasille => {
  const $text = VasilleState(Vasille.id, Vasille.runner, "$text", VasilleRef("text", [VasilleFilePath, 4, 6, 4, 20], Vasille.runner.inspector));
  Vasille.text(VasillePosText($text, [VasilleFilePath, 6, 5, 6, 10]));
}, [VasilleFilePath, 3, 10, 7, 2], "C");