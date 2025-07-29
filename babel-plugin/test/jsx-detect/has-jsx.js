import { compose, Slot } from "vasille-web";
export const C = compose((Vasille, {
  slot01
}) => {
  Slot(Vasille, {
    model: slot01,
    a: 1,
    b: 2
  });
}, "VasilleWeb:C");
export const C1 = compose(Vasille => {
  C(Vasille, {
    slot01: ({
      a,
      b
    }) => {
      console.log(a, b);
      debugger;
    },
    slot02: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      do {
        b.$ > 1 && Vasille.tag("div", {});
      } while (b.$ < 1);
    },
    slot03: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      for (const key in {}) {
        key.length > 1 ? Vasille.tag("div", {}) : 0;
      }
    },
    slot04: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      switch (a.$) {
        case 1:
          a.$ > 1 ? 2 : Vasille.tag("div", {});
          break;
      }
    },
    slot05: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      while (b.$ < 1) {
        Vasille.tag("div", {});
      }
    },
    slot06: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      for (const item of []) {
        Vasille.tag("div", {});
      }
    },
    slot07: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      Vasille.tag("div", {});
    },
    slot08: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      try {
        Vasille.tag("div", {});
      } catch (e) {
        console.log(e);
      }
    },
    slot09: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      try {
        console.log(1);
      } catch (e) {
        Vasille.tag("div", {});
      }
    },
    slot10: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      try {
        console.log(1);
      } finally {
        Vasille.tag("div", {});
      }
    },
    slot11: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      for (let i = 0; i < 9; i++) {
        Vasille.tag("div", {});
      }
    },
    slot12: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      if (a.$ > 1) {
        Vasille.tag("div", {});
      }
    },
    slot13: ({
      a,
      b
    }, Vasille) => {
      console.log(a.$, b.$);
      if (a.$ > 1) {
        console.log(a.$);
      } else {
        Vasille.tag("div", {});
      }
    },
    slot14: (_VasilleWeb, Vasille) => {
      return Vasille.tag("div", {});
    },
    slot19: (_VasilleWeb, Vasille) => Vasille.tag("div", {})
  });
}, "VasilleWeb:C1");
