import { compose, $ as VasilleDX } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(1);
  const o = VasilleDX.ro(Vasille, {
    b: 1
  });
  const c = Vasille.expr(Vasille_a => {
    o.b.$++;
    do {
      a.$++;
    } while (Vasille_a < 1);
    for (const i in [0, 1]) {
      a.$++;
    }
    for (const i of [0, 1]) {
      a.$++;
    }
    for (let i = Vasille_a; i < Vasille_a; i += Vasille_a) {
      a.$++;
    }
    for (a.$ = 3; Vasille_a < 4; a.$++) {
      a.$++;
    }
    label: if (Vasille_a < 3) {
      a.$++;
    }
    switch (Vasille_a) {
      case Vasille_a:
        a.$++;
        break;
    }
    try {
      throw Vasille_a;
    } catch (e) {
      a.$++;
    } finally {
      a.$++;
    }
    while (Vasille_a < 1) {
      a.$++;
    }
    return 0;
  }, a);
}, "VasilleDX:C");
