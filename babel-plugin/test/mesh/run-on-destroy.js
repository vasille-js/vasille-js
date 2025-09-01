import { compose } from "vasille-web";
const C = compose(Vasille => {
  Vasille.runOnDestroy(() => {
    console.log("destroy called");
  });
});
