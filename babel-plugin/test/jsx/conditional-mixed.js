import { compose, ref as VasilleRef, expr as VasilleExpr, Switch as VasilleSwitch } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(1, "a");
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < 1, [$a]),
      slot: () => Vasille.text("smaller then 1")
    }, {
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a > 2, [$a]),
      slot: () => Vasille.text("bigger then 2")
    }]
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < 1, [$a]),
      slot: () => VasilleSwitch({
        cases: [{
          $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < -1, [$a]),
          slot: () => Vasille.text("smaler then -1 & 1")
        }]
      }, Vasille)
    }],
    default: () => Vasille.text("bigger then 2")
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < 1, [$a]),
      slot: () => VasilleSwitch({
        cases: [{
          $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < -10, [$a]),
          slot: () => Vasille.text("smaller then -10 & 1")
        }],
        default: () => {
          Vasille.text("bigger then -10");
          Vasille.text("smaller then 1");
        }
      }, Vasille)
    }]
  }, Vasille);
}, "C");
