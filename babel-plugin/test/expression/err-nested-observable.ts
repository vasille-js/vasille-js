import { Reference } from "vasille";
import { compose } from "vasille-dx";

const obj = new Reference({
  nested: new Reference(2),
});

export const C = compose(() => {
  let a = 0;
  const c = a + obj.$.nested.$;
});
