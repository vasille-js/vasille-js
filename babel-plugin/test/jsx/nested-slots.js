import { Slot, compose } from "vasille-web";
export const C1 = compose((Vasille, {
  slot
}) => {
  const a = Vasille.ref(0, "a");
  Vasille.tag("div", {}, Vasille => {
    Slot(Vasille, {
      model: slot,
      a: a
    });
  });
}, "VasilleWeb:C1");
export const C2 = compose(Vasille => {
  const a = Vasille.ref(2, "a");
  C1(Vasille, {
    slot: ({
      a
    }) => {
      console.log(a);
    }
  });
  C1(Vasille, {
    slot: ({
      a
    }, Vasille) => {
      console.log(a.$);
      Vasille.text(a);
    }
  });
  C1(Vasille, {
    slot: (_VasilleWeb, Vasille) => {
      Vasille.tag("div", {});
    }
  });
  console.log(a.$);
}, "VasilleWeb:C2");
