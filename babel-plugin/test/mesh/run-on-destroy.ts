import { beforeDestroy, compose } from "steel-frame";

const C = compose(() => {
  beforeDestroy(() => {
    console.log("destroy called");
  });
});
