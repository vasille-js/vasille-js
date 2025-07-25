import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref("a");
  Vasille.tag("div", {
    attr: {
      dir: "ltr",
      "data-let": a
    }
  });
}, "VasilleDX:C");
