import { Reference } from "vasille";
import { compose } from "vasille-dx";
const obj = {
  nested: new Reference({
    level2: 2
  })
};
export const C = compose(Vasille => {
  const a = Vasille.ref(2);
  const sum = Vasille.expr((Vasille_a, Vasille_obj_nested_$) => {
    return Vasille_a + Vasille_obj_nested_$.level2;
  }, a, obj.nested);
  Vasille.watch(function update(Vasille_obj_nested_$, Vasille_a) {
    let rest;
    a.$ = 3;
    obj.nested.$.level2 = 3;
    [a.$, obj.nested.$.level2, ...rest] = [Vasille_obj_nested_$.level2, Vasille_a];
  }, obj.nested, a);
}, "VasilleDX:C");
