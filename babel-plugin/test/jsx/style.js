import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref("auto", "a");
  Vasille.tag("div", {
    attr: {
      style: "width:100px;height:50px;padding:1px 2px 3px 4px"
    },
    style: {
      ...{
        margin: "1px"
      },
      "margin-left": a
    }
  });
  Vasille.tag("div", {
    attr: {
      style: "margin: 20px;"
    }
  });
  Vasille.tag("div", {
    attr: {
      style: "margin: 20px;"
    }
  });
  Vasille.tag("div", {
    attr: {
      style: Vasille.expr(Vasille_a => `margin: ${Vasille_a}`, [a])
    }
  });
}, "VasilleDX:C");
