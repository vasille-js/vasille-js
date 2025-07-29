import { compose } from "vasille-web";
export const C = compose(Vasille => {
  const a = Vasille.ref(0.5, "a");
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
  Vasille.tag("video", {
    bind: {
      volume: Vasille.expr(Vasille_a => Vasille_a + 0.1, [a])
    }
  });
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
}, "VasilleWeb:C");
