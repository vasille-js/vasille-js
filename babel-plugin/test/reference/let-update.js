import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const count = Vasille.ref(1);
  function inc() {
    count.$ += 1;
    count.$ = count.$ + 1;
    count.$ = parseInt(count.$.toFixed(0));
  }
});