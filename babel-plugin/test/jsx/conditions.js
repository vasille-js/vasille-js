import { compose, ref as VasilleRef, Switch as VasilleSwitch } from "vasille-web";
const C = compose(Vasille => {
  const $condition = VasilleRef(true);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => {
        Vasille.text("if 1");
      }
    }]
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => Vasille.text("if 2")
    }]
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => {
        Vasille.text("if 3");
      }
    }],
    default: Vasille => {
      Vasille.text("else 3");
    }
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => Vasille.text("if 4")
    }],
    default: Vasille => Vasille.text("else 4")
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => {
        Vasille.text("if 5");
      }
    }, {
      $case: $condition,
      slot: Vasille => {
        Vasille.text("else if 5");
      }
    }],
    default: Vasille => {
      Vasille.text("else 5");
    }
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => Vasille.text("if 6")
    }, {
      $case: $condition,
      slot: Vasille => Vasille.text("else if 6")
    }],
    default: Vasille => Vasille.text("else 6")
  }, Vasille);
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => {
        Vasille.text("if 7");
      }
    }]
  }, Vasille);
  Vasille.tag("div", {});
  VasilleSwitch({
    cases: [{
      $case: $condition,
      slot: Vasille => {
        Vasille.text("if 8");
      }
    }]
  }, Vasille);
  Vasille.tag("div", {});
});
