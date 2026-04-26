const VasilleFilePath = "babel-plugin-vasille/test/dev/prompt.tsx";
import { component, prompt, wrapFn as VasilleWrap, positionedText as VasillePosText } from "steel-frame";
const promptName = prompt(Vasille => {}, [VasilleFilePath, 3, 19, 3, 35], "promptName");
const C = component(Vasille => {
  Vasille.tag("button", {
    e: {
      click: VasilleWrap(() => promptName(Vasille, {}, void 0, [VasilleFilePath, 6, 25, 6, 39]), [VasilleFilePath, 6, 19, 6, 39])
    },
    usage: [VasilleFilePath, 6, 2, 6, 61]
  }, Vasille => {
    Vasille.text(VasillePosText("Prompt Name", [VasilleFilePath, 6, 41, 6, 52]));
  });
}, [VasilleFilePath, 5, 10, 7, 2], "C");