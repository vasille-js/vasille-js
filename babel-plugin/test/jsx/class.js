import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
let c = "c";
const C = compose(Vasille => {
  const $a = VasilleRef("a", "a");
  const $b = VasilleRef(false, "b");
  Vasille.tag("div", {
    attr: {
      class: "static1 static2"
    }
  });
  Vasille.tag("div", {
    class: [$a]
  });
  Vasille.tag("div", {
    class: [{
      aIsB: VasilleExpr(Vasille, Vasille_a => Vasille_a === "b", [$a])
    }]
  });
  Vasille.tag("div", {
    class: [{
      cIsB: c === "b"
    }]
  });
  Vasille.tag("div", {
    class: [c]
  });
  Vasille.tag("div", {
    class: [{
      hover: true,
      "b": $b,
      ...{
        active: true
      }
    }]
  });
  Vasille.tag("div", {
    class: [...[$a]]
  });
  Vasille.tag("div", {
    attr: {
      class: "a b"
    }
  });
  Vasille.tag("div", {
    attr: {
      class: "a b"
    }
  });
  Vasille.tag("div", {
    attr: {
      class: VasilleExpr(Vasille, Vasille_a => `${Vasille_a} b`, [$a])
    }
  });
  Vasille.tag("div", {
    attr: {
      class: `${"a"} b`
    }
  });
  Vasille.tag("div", {
    attr: {
      class: $a
    }
  });
}, "C");
