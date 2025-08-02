import { Slot, compose } from "vasille-web";
export const C1 = compose((Vasille, {
  slot
}) => {
  const a = Vasille.ref(0, "a");
  Vasille.tag("div", {}, Vasille => {
    Slot({
      model: slot,
      a: a
    }, Vasille);
  });
}, "VasilleWeb:C1");
export const C2 = compose(Vasille => {
  const a = Vasille.ref(2, "a");
  C1({
    slot: ({
      a
    }) => {
      console.log(a);
    }
  }, Vasille);
  C1({
    slot: ({
      a
    }, Vasille) => {
      console.log(a.$);
      Vasille.text(a);
    }
  }, Vasille);
  C1({
    slot: (_VasilleWeb, Vasille) => {
      Vasille.tag("div", {});
    }
  }, Vasille);
  console.log(a.$);
}, "VasilleWeb:C2");
