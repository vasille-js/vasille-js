import { compose, $ as Vasille } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const count = this.ref(1);
  function inc() {
    count.$ += 1;
    count.$ = count.$ + 1;
    count.$ = parseInt(count.$.toFixed(0));
  }
});