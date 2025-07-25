import { Reference } from "vasille";
import { compose } from "vasille-dx";

let o = { a: new Reference(2) };

const c = compose(() => {
  const o1 = { a: 1 };
  const c1 = o.a.$;
  const c2 = o1.a;
  const s = c1 + c2;
});
