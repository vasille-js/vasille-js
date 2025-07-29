import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref("a", "a");
  Vasille.tag("div", {
    attr: {
      dir: "ltr",
      "data-let": a,
      contenteditable: true
    }
  });
}, "VasilleWeb:C");
