import { beforeDestroy, compose } from "vasille-web";

const C = compose(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });
});
