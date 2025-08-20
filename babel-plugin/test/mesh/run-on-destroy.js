import { compose } from "vasille-web";
export const C = compose(Vasille => {
  Vasille.runOnDestroy(() => {
    console.log("destroy called");
  });
});
