import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $class = VasilleRef("name", "class");
  Vasille.tag("div", {
    callback: div => {
      div.className = $class.V;
    }
  });
}, "C");