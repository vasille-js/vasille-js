import { router, store } from "vasille-web";

export const S = store(() => {
  function goNext() {
    router()?.navigate("/:test", { test: "x" }, "loading-overlay");
  }

  return {};
});
