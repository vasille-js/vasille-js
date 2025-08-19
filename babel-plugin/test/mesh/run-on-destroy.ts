import { beforeDestroy, view } from "vasille-web";

export const C = view(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });
});
