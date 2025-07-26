import { compose } from "vasille-dx";
let c = 'c';
export const C = compose(Vasille => {
  const a = Vasille.ref("a", "a");
  const b = Vasille.ref(false, "b");
  Vasille.tag("div", {
    attr: {
      class: "static1 static2"
    }
  });
  Vasille.tag("div", {
    class: [a]
  });
  Vasille.tag("div", {
    class: [{
      aIsB: Vasille.expr(Vasille_a => Vasille_a === "b", [a])
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
      "b": b,
      ...{
        active: true
      }
    }]
  });
  Vasille.tag("div", {
    class: [...[a]]
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
      class: Vasille.expr(Vasille_a => `${Vasille_a} b`, [a])
    }
  });
  Vasille.tag("div", {
    attr: {
      class: `${"a"} b`
    }
  });
  Vasille.tag("div", {
    attr: {
      class: a
    }
  });
}, "VasilleDX:C");
