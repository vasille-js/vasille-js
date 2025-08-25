import { compose, backward, ref as VasilleRef } from "vasille-web";
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
    "$test": backward($test)
  }, Vasille);
  C2({
    "$test": backward(obj.$test)
  }, Vasille);
}, "C2");
