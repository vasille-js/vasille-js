import { calculate, compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef(1);
  const o = {
    b: 1
  };
  const $c = calculate(Vasille, Vasille_0 => {
    o.b++;
    do {
      $a.V++;
    } while (Vasille_0 < 1);
    for (const i in [0, 1]) {
      $a.V++;
    }
    for (const i of [0, 1]) {
      $a.V++;
    }
    for (let i = Vasille_0; i < Vasille_0; i += Vasille_0) {
      $a.V++;
    }
    for ($a.V = 3; Vasille_0 < 4; $a.V++) {
      $a.V++;
    }
    label: if (Vasille_0 < 3) {
      $a.V++;
    }
    switch (Vasille_0) {
      case Vasille_0:
        $a.V++;
        break;
    }
    try {
      throw Vasille_0;
    } catch (e) {
      $a.V++;
    } finally {
      $a.V++;
    }
    while (Vasille_0 < 1) {
      $a.V++;
    }
    return 0;
  }, [$a]);
});
