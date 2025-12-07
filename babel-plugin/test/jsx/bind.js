import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(0.5);
  const b = 0;
  Vasille.tag("video", {
    b: {
      volume: $a
    }
  });
  Vasille.tag("video", {
    b: {
      volume: b
    }
  });
  Vasille.tag("video", {
    b: {
      volume: 1
    }
  });
  Vasille.tag("video", {
    b: {
      volume: VasilleExpr(Vasille, Vasille_0 => Vasille_0 + 0.1, [$a])
    }
  });
  // @ts-expect-error
  Vasille.tag("video", {
    b: {
      volume: b + 0.1
    }
  });
  Vasille.tag("video", {
    b: {
      volume: true
    }
  });
  Vasille.tag("input", {
    b: {
      value: "value"
    }
  });
});
