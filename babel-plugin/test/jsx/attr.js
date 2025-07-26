import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref("a", "a");
  Vasille.tag("div", {
    attr: {
      dir: "ltr",
      "data-let": a,
      contenteditable: true
    }
  });
}, "VasilleDX:C");
