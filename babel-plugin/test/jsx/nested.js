import { compose, ref as VasilleRef, expr as VasilleExpr, Switch as VasilleSwitch } from "vasille-web";
export const C1 = compose((Vasille, props) => {
  Vasille.tag("div", {});
}, "C1");
export const C2 = compose(Vasille => {
  const $a = VasilleRef(1, "a");
  Vasille.tag("div", {}, Vasille => {
    C1({
      "$bool": VasilleRef(true),
      "$a": VasilleRef(1),
      "$b": VasilleRef(2),
      "$c": VasilleRef("text")
    }, Vasille, (_VasilleWeb, Vasille) => {
      C1({
        ...{
          $a: VasilleRef(1)
        },
        "$b": VasilleExpr(Vasille, Vasille_a => Vasille_a + 1, [$a]),
        "$bool": VasilleRef(true)
      }, Vasille, (_VasilleWeb, Vasille) => {
        Vasille.tag("div", {});
        Vasille.tag("span", {}, Vasille => {
          Vasille.text("1");
        });
      });
    });
  });
  C1({
    slot: (_VasilleWeb, Vasille) => {
      C1({}, Vasille);
    }
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a > 1, [$a]),
      slot: Vasille => {
        C1({}, Vasille);
      }
    }]
  }, Vasille);
}, "C2");
