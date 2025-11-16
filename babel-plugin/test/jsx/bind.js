import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(0.5);
  const b = 0;
  Vasille.tag("video", {
    bind: {
      volume: $a
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
  Vasille.tag("video", {
    bind: {
      volume: VasilleExpr(Vasille, Vasille_0 => Vasille_0 + 0.1, [$a])
    }
  });
  // @ts-expect-error
  Vasille.tag("video", {
    bind: {
      volume: b + 0.1
    }
  });
  Vasille.tag("video", {
    bind: {
      volume: true
    }
  });
  Vasille.tag("input", {
    bind: {
      value: "value"
    }
  });
});
