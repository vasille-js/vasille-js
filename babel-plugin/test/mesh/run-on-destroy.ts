import { runOnDestroy, view } from "vasille-web";

export const C = view(() => {
  runOnDestroy(() => {
    console.log("destroy called");
  });
});
