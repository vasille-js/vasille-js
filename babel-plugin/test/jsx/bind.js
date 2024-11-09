import { compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const a = Vasille.ref(0.5);
  const b = 0;
  Vasille.tag("video", {
    bind: {
      volume: a
    }
  });
  Vasille.tag("video", {
    bind: {
      volume: b
    }
  });
  Vasille.tag("video", {
    bind: {
      volume: 1
    }
  });
});