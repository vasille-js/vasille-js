import { Reference } from "vasille";
import { compose, $ as VasilleDX } from "vasille-dx";
let o = {
  a: new Reference(2)
};
const c = compose(Vasille => {
  const o1 = VasilleDX.ro(Vasille, {
    a: 1
  });
  const c1 = o.a;
  const c2 = o1.a;
  const s = Vasille.expr((Vasille_c1, Vasille_c2) => Vasille_c1 + Vasille_c2, c1, c2);
}, "VasilleDX:c");
