import { Slot, compose } from "vasille-dx";
export const C1 = compose(function VasilleDX_C1(Vasille, {
  slot
}) {
  const a = Vasille.ref(0);
  Vasille.tag("div", {}, Vasille => {
    Slot(Vasille, {
      model: slot,
      a: a
    });
  });
});
export const C2 = compose(function VasilleDX_C2(Vasille) {
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
    slot: (VasilleDX_, Vasille) => {
      Vasille.tag("div", {});
    }
  });
});