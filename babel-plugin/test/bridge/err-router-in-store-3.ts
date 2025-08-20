import { calculate, router, store } from "vasille-web";

const sStore = store(() => {
  let $a = 2;
  const b = calculate(() => {
    router()?.navigate("/:a", { a: "1" }, "loading-screen");

    return $a + 1;
  });

  return {};
});
