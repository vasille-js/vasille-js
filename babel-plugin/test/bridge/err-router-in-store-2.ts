import { router, store } from "vasille-web";

const sStore = store(() => {
  function goNext() {
    router()?.navigate("/:test", { test: "x" }, "loading-overlay");
  }

  return {};
});
