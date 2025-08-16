import { Slot, compose, ref as VasilleRef } from "vasille-web";
export const C1 = compose((Vasille, {
  slot
}) => {
  const $a = VasilleRef(0, "a");
  Vasille.tag("div", {}, Vasille => {
    Slot({
      model: slot,
      "$a": $a
    }, Vasille);
  });
}, "C1");
export const C2 = compose(Vasille => {
  const $a = VasilleRef(2, "a");
  C1({
    slot: ({
      $a = VasilleRef()
    }) => {
      console.log($a.V);
    }
  }, Vasille);
  C1({
    slot: ({
      $a = VasilleRef()
    }, Vasille) => {
      console.log($a.V);
      Vasille.text($a);
    }
  }, Vasille);
  C1({
    slot: (_VasilleWeb, Vasille) => {
      Vasille.tag("div", {});
    }
  }, Vasille);
  console.log($a.V);
}, "C2");
