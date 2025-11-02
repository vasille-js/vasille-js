import { compose, Slot, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
const C = compose((Vasille, {
  slot02
}) => {
  Slot({
    model: slot02,
    "$a": VasilleRef(1),
    "$b": VasilleRef(2)
  }, Vasille);
}, "C");
const C1 = compose(Vasille => {
  C({
    slot01: ({
      a,
      b
    }) => {
      console.log(a, b);
    },
    slot02: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      Vasille.tag("div", {});
      VasilleSafe(() => console.log($a.V, $b.V))();
    },
    slot03: (_VasilleWeb, Vasille) => Vasille.tag("div", {})
  }, Vasille);
}, "C1");
