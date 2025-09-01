import { calculate, compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = calculate(Vasille, Vasille_a => {
    Vasille.runner.router?.goTo("/1");
    return Vasille_a + 1;
  }, [$a], "b");
  function goNext() {
    Vasille.runner.router?.goTo("/x");
  }
  Vasille.runner.router?.goTo("/");
  Vasille.runner.router;
}, "C");
