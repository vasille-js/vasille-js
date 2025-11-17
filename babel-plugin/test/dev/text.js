const VasilleFilePath = "babel-plugin-vasille/test/dev/text.tsx";
import { component, positionedText as VasillePosText } from "vasille-web";
const C = component(Vasille => {
  Vasille.text(VasillePosText("Text", [VasilleFilePath, 4, 4, 4, 8]));
}, [VasilleFilePath, 3, 10, 5, 2], "C");