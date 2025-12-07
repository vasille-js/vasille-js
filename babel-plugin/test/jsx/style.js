import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef("auto");
  const b = "auto";
  Vasille.tag("div", {
    a: {
      style: "width:100px;height:50px;padding:1px 2px 3px 4px"
    },
    s: {
      ...{
        margin: "1px"
      },
      "margin-left": $a
    }
  });
  Vasille.tag("div", {
    a: {
      style: "margin: 20px;"
    }
  });
  Vasille.tag("div", {
    a: {
      style: "margin: 20px;"
    }
  });
  Vasille.tag("div", {
    a: {
      style: VasilleExpr(Vasille, Vasille_0 => `margin: ${Vasille_0}`, [$a])
    }
  });
  Vasille.tag("div", {
    a: {
      style: `margin: ${b}`
    }
  });
});
