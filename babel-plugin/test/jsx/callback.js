import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $class = VasilleRef("name");
  Vasille.tag("div", {
    k: div => {
      div.className = $class.V;
    }
  });
});