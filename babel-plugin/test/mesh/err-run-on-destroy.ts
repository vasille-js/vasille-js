import { beforeDestroy, store } from "vasille-web";

export const cStore = store(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });

  return {};
});
