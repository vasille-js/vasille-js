import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref(2, "a");
  const b = Vasille.expr(Vasille_a => {
    Vasille.runner.router?.navigate("/:a", {
      a: "1"
    }, "loading-screen");
    return Vasille_a + 1;
  }, [a], "b");
  Vasille.runner.router?.navigate("/", {}, "silent");
  Vasille.runner.router;
  function goNext() {
    Vasille.runner.router?.navigate("/:test", {
      test: "x"
    }, "loading-overlay");
  }
}, "VasilleWeb:C");
