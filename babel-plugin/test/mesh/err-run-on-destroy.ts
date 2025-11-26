import { beforeDestroy, store } from "steel-frame";

const cStore = store(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });

  return {};
});
