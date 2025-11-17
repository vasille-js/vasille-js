const VasilleFilePath = "babel-plugin-vasille/test/dev/tag.tsx";
import { component } from "vasille-web";
const C = component(Vasille => {
  Vasille.tag("div", {
    usage: [VasilleFilePath, 4, 2, 4, 13]
  });
}, [VasilleFilePath, 3, 10, 5, 2], "C");