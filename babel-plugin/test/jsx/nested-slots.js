import { Slot, compose } from "vasille-dx";
export const C1 = compose((Vasille, {
  slot
}) => {
  const a = Vasille.ref(0);
  Vasille.tag("div", {}, Vasille => {
    Slot(Vasille, {
      model: slot,
      a: a
    });
  });
}, "VasilleDX:C1");
export const C2 = compose(Vasille => {
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
    slot: (_VasilleDX, Vasille) => {
      Vasille.tag("div", {});
    }
  });
}, "VasilleDX:C2");
