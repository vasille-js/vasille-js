import { view } from "vasille-web";
export const C = view(Vasille => {
  Vasille.runOnDestroy(() => {
    console.log("destroy called");
  });
});
