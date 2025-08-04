import { router } from "vasille-web";

function x() {
  router()?.navigate("/:test", { test: "x" }, "silent");
}
