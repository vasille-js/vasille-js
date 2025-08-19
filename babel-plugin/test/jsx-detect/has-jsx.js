import { compose, Slot, ref as VasilleRef } from "vasille-web";
export const C = compose((Vasille, {
  slot02
}) => {
  Slot({
    model: slot02,
    "$a": VasilleRef(1),
    "$b": VasilleRef(2)
  }, Vasille);
}, "C");
export const C1 = compose(Vasille => {
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
      console.log($a.V, $b.V);
    },
    slot03: (_VasilleWeb, Vasille) => <div />
  }, Vasille);
}, "C1");
