import { beforeDestroy, store } from "vasille-web";

const cStore = store(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });

  return {};
});
