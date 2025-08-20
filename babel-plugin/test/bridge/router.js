import { calculate, compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(2, "a");
  const $b = calculate(Vasille, Vasille_a => {
    Vasille.runner.router?.navigate("/:a", {
      a: "1"
    }, "loading-screen");
    return Vasille_a + 1;
  }, [$a], "b");
  function goNext() {
    Vasille.runner.router?.navigate("/:test", {
      test: "x"
    }, "loading-overlay");
  }
  Vasille.runner.router?.navigate("/", {}, "silent");
  Vasille.runner.router;
}, "C");
