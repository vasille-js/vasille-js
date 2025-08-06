import { runOnDestroy, store } from "vasille-web";

export const C = store(() => {
  runOnDestroy(() => {
    console.log("destroy called");
  });
});
