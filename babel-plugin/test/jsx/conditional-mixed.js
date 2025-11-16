import { compose, ref as VasilleRef, expr as VasilleExpr, Switch as VasilleSwitch } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(1);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_0 => Vasille_0 < 1, [$a]),
      slot: Vasille => Vasille.text("smaller then 1")
    }, {
      $case: VasilleExpr(Vasille, Vasille_0 => Vasille_0 > 2, [$a]),
      slot: Vasille => Vasille.text("bigger then 2")
    }]
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_0 => Vasille_0 < 1, [$a]),
      slot: Vasille => VasilleSwitch({
        cases: [{
          $case: VasilleExpr(Vasille, Vasille_0 => Vasille_0 < -1, [$a]),
          slot: Vasille => Vasille.text("smaler then -1 & 1")
        }]
      }, Vasille)
    }],
    default: Vasille => Vasille.text("bigger then 2")
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_0 => Vasille_0 < 1, [$a]),
      slot: Vasille => VasilleSwitch({
        cases: [{
          $case: VasilleExpr(Vasille, Vasille_0 => Vasille_0 < -10, [$a]),
          slot: Vasille => Vasille.text("smaller then -10 & 1")
        }],
        default: Vasille => {
          Vasille.text("bigger then -10");
          Vasille.text("smaller then 1");
        }
      }, Vasille)
    }]
  }, Vasille);
});
