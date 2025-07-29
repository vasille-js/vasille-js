import { compose, If } from "vasille-web";
export const C1 = compose((Vasille, props) => {
  Vasille.tag("div", {});
}, "VasilleWeb:C1");
export const C2 = compose(Vasille => {
  const a = Vasille.ref(1, "a");
  Vasille.tag("div", {}, Vasille => {
    C1(Vasille, {
      bool: true,
      a: 1,
      b: 2,
      c: "text"
    }, (_VasilleWeb, Vasille) => {
      C1(Vasille, {
        ...{
          a: 1
        },
        b: Vasille.expr(Vasille_a => Vasille_a + 1, [a]),
        bool: true
      }, (_VasilleWeb, Vasille) => {
        Vasille.tag("div", {});
        Vasille.tag("span", {}, Vasille => {
          Vasille.text("1");
        });
      });
    });
  });
  C1(Vasille, {
    slot: (_VasilleWeb, Vasille) => {
      C1(Vasille, {});
    }
  });
  If(Vasille, {
    condition: Vasille.expr(Vasille_a => Vasille_a > 1, [a])
  }, Vasille => {
    C1(Vasille, {});
  });
}, "VasilleWeb:C2");
