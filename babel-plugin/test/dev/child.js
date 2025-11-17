const VasilleFilePath = "babel-plugin-vasille/test/dev/child.tsx";
import { component, positionedText as VasillePosText } from "vasille-web";
const C = component(Vasille => {
  Vasille.tag("div", {
    usage: [VasilleFilePath, 4, 2, 6, 8]
  }, Vasille => {
    Vasille.tag("span", {
      usage: [VasilleFilePath, 5, 4, 5, 21]
    }, Vasille => {
      Vasille.text(VasillePosText("text", [VasilleFilePath, 5, 10, 5, 14]));
    });
  });
}, [VasilleFilePath, 3, 10, 7, 2], "C");
const C2 = component(Vasille => {
  C({}, Vasille, void 0, [VasilleFilePath, 10, 2, 10, 7]);
}, [VasilleFilePath, 9, 11, 11, 2], "C2");