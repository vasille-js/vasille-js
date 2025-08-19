import { beforeDestroy, store } from "vasille-web";

export const C = store(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });

  return {};
});
