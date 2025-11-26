import { router, store } from "steel-frame";

const sStore = store(() => {
  function goNext() {
    router()?.goTo("/x");
  }

  return {};
});
