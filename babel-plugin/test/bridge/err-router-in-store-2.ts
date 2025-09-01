import { router, store } from "vasille-web";

const sStore = store(() => {
  function goNext() {
    router()?.goTo("/x");
  }

  return {};
});
