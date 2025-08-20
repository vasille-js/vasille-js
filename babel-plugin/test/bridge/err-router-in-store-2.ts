import { router, store } from "vasille-web";

export const sStore = store(() => {
  function goNext() {
    router()?.navigate("/:test", { test: "x" }, "loading-overlay");
  }

  return {};
});
