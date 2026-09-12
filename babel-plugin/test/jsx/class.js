import { compose, ref as VasilleRef, expr as VasilleExpr } from "vasille-web";
let c = "c";
const C = compose(Vasille => {
  const $a = VasilleRef("a");
  const $b = VasilleRef(false);
  Vasille.tag("div", {
    a: {
      class: "static1 static2"
    }
  });
  Vasille.tag("div", {
    c: [$a]
  });
  Vasille.tag("div", {
    c: [{
      aIsB: VasilleExpr(Vasille, Vasille_0 => Vasille_0 === "b", [$a])
    }]
  });
  Vasille.tag("div", {
    c: [{
      cIsB: c === "b"
    }]
  });
  Vasille.tag("div", {
    c: [c]
  });
  Vasille.tag("div", {
    c: [{
      hover: true,
      "b": $b,
      ...{
        active: true
      }
    }]
  });
  Vasille.tag("div", {
    c: [...[$a]]
  });
  Vasille.tag("div", {
    a: {
      class: "a b"
    }
  });
  Vasille.tag("div", {
    a: {
      class: "a b"
    }
  });
  Vasille.tag("div", {
    a: {
      class: VasilleExpr(Vasille, Vasille_0 => `${Vasille_0} b`, [$a])
    }
  });
  Vasille.tag("div", {
    a: {
      class: `${"a"} b`
    }
  });
  Vasille.tag("div", {
    c: [$a]
  });
});
