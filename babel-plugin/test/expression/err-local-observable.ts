import { Reference } from "vasille";
import { calculate, compose } from "vasille-dx";

export const C = compose(() => {
  let a = 0;
  const c = calculate(() => {
    const obj = {
      nested: new Reference(2),
    };

    return a + obj.nested.$;
  });
});
