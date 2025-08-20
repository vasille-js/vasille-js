import { beforeDestroy, compose } from "vasille-web";

export const C = compose(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });
});
