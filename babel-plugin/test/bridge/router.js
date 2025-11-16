import { calculate, compose, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2);
  const $b = calculate(Vasille, Vasille_0 => {
    Vasille.runner.router?.goTo("/1");
    return Vasille_0 + 1;
  }, [$a]);
  function goNext() {
    Vasille.runner.router?.goTo("/x");
  }
  VasilleSafe(() => Vasille.runner.router?.goTo("/"))();
  VasilleSafe(() => Vasille.runner.router)();
});
