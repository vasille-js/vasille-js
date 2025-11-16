import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $count = VasilleRef(1);
  function inc() {
    $count.V += 1;
    $count.V = $count.V + 1;
    $count.V = parseInt($count.V.toFixed(0));
  }
});
