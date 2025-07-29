import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const count = Vasille.ref(1, "count");
  function inc() {
    count.$ += 1;
    count.$ = count.$ + 1;
    count.$ = parseInt(count.$.toFixed(0));
  }
}, "VasilleWeb:C");
