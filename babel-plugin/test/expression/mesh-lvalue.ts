import { Reference } from "vasille";
import { calculate, compose, watch } from "vasille-dx";

const obj = {
  nested: new Reference({
    level2: 2,
  }),
};

export const C = compose(() => {
  let a = 2;
  const sum = calculate(() => {
    return a + obj.nested.$.level2;
  });

  watch(function update() {
    let rest;

    a = 3;
    obj.nested.$.level2 = 3;
    [a, obj.nested.$.level2, ...rest] = [obj.nested.$.level2, a];
  });
});
