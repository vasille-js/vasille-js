import { calculate, compose, router } from "vasille-web";

export const C = compose(() => {
  let a = 2;
  const b = calculate(() => {
    router()?.navigate("/:a", { a: "1" }, "loading-screen");

    return a + 1;
  });

  router()?.navigate("/", {}, "silent");
  router();

  function goNext() {
    router()?.navigate("/:test", { test: "x" }, "loading-overlay");
  }
});
