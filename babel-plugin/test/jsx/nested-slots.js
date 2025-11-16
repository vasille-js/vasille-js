import { Slot, compose, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
const C1 = compose((Vasille, {
  slot
}) => {
  const $a = VasilleRef(0);
  Vasille.tag("div", {}, Vasille => {
    Slot({
      model: slot,
      "$a": $a
    }, Vasille);
  });
});
const C2 = compose(Vasille => {
  const $a = VasilleRef(2);
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
      VasilleSafe(() => console.log($a.V))();
      Vasille.text($a);
    }
  }, Vasille);
  C1({
    slot: (_VasilleWeb, Vasille) => {
      Vasille.tag("div", {});
    }
  }, Vasille);
  VasilleSafe(() => console.log($a.V))();
});
