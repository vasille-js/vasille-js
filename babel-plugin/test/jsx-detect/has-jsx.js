import { compose, Slot, ref as VasilleRef } from "vasille-web";
export const C = compose((Vasille, {
  slot02
}) => {
  Slot({
    model: slot02,
    "$a": VasilleRef(1),
    "$b": VasilleRef(2)
  }, Vasille);
}, "C");
export const C1 = compose(Vasille => {
  C({
    slot01: ({
      a,
      b
    }) => {
      console.log(a, b);
      debugger;
    },
    slot02: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      do {
        $b.V > 1 && Vasille.tag("div", {});
      } while ($b.V < 1);
    },
    slot03: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      for (const key in {}) {
        key.length > 1 ? Vasille.tag("div", {}) : 0;
      }
    },
    slot04: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      switch ($a.V) {
        case 1:
          $a.V > 1 ? 2 : Vasille.tag("div", {});
          break;
      }
    },
    slot05: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      while ($b.V < 1) {
        Vasille.tag("div", {});
      }
    },
    slot06: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      for (const item of []) {
        Vasille.tag("div", {});
      }
    },
    slot07: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      Vasille.tag("div", {});
    },
    slot08: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      try {
        Vasille.tag("div", {});
      } catch (e) {
        console.log(e);
      }
    },
    slot09: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      try {
        console.log(1);
      } catch (e) {
        Vasille.tag("div", {});
      }
    },
    slot10: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      try {
        console.log(1);
      } finally {
        Vasille.tag("div", {});
      }
    },
    slot11: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      for (let i = 0; i < 9; i++) {
        Vasille.tag("div", {});
      }
    },
    slot12: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      if ($a.V > 1) {
        Vasille.tag("div", {});
      }
    },
    slot13: ({
      $a = VasilleRef(),
      $b = VasilleRef()
    }, Vasille) => {
      console.log($a.V, $b.V);
      if ($a.V > 1) {
        console.log($a.V);
      } else {
        Vasille.tag("div", {});
      }
    },
    slot14: (_VasilleWeb, Vasille) => {
      return Vasille.tag("div", {});
    },
    slot19: (_VasilleWeb, Vasille) => Vasille.tag("div", {})
  }, Vasille);
}, "C1");
