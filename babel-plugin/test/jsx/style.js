import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref("auto");
  Vasille.tag("div", {
    attr: {
      style: "width:100px;height:50px;padding:1px 2px 3px 4px"
    },
    style: {
      "margin-left": a
    }
  });
});