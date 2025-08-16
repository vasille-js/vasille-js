import { compose, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const $a = VasilleRef("a", "a");
  Vasille.tag("div", {
    attr: {
      dir: "ltr",
      "data-let": $a,
      contenteditable: true
    }
  });
}, "C");
