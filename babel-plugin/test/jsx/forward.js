import { compose, forward, ref as VasilleRef } from "vasille-web";
const C1 = compose((Vasille, {
  $test = VasilleRef()
}) => {
  Vasille.text($test);
}, "C1");
const C2 = compose(Vasille => {
  const $test = VasilleRef("2", "test");
  const obj = {
    $test: VasilleRef("3")
  };
  C1({
    "$test": forward($test)
  }, Vasille);
  C2({
    "$test": forward(obj.$test)
  }, Vasille);
}, "C2");
