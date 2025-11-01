import { compose, ref as VasilleRef, expr as VasilleExpr, Switch as VasilleSwitch } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(1, "a");
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < 1, [$a]),
      slot: Vasille => Vasille.text("smaller then 1")
    }]
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: VasilleExpr(Vasille, Vasille_a => Vasille_a < 1 && Vasille_a < 2, [$a]),
      slot: Vasille => Vasille.text("smaller then 2")
    }]
  }, Vasille);
}, "C");
