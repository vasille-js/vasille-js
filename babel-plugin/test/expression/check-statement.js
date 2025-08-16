import { calculate, compose, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const $a = VasilleRef(1, "a");
  const o = {
    b: 1
  };
  const $c = calculate(Vasille, Vasille_a => {
    o.b++;
    do {
      $a.V++;
    } while (Vasille_a < 1);
    for (const i in [0, 1]) {
      $a.V++;
    }
    for (const i of [0, 1]) {
      $a.V++;
    }
    for (let i = Vasille_a; i < Vasille_a; i += Vasille_a) {
      $a.V++;
    }
    for ($a.V = 3; Vasille_a < 4; $a.V++) {
      $a.V++;
    }
    label: if (Vasille_a < 3) {
      $a.V++;
    }
    switch (Vasille_a) {
      case Vasille_a:
        $a.V++;
        break;
    }
    try {
      throw Vasille_a;
    } catch (e) {
      $a.V++;
    } finally {
      $a.V++;
    }
    while (Vasille_a < 1) {
      $a.V++;
    }
    return 0;
  }, [$a], "c");
}, "C");
