import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref(0);
  const b = Vasille.ref(1);
  const c = Vasille.ref(2);
  const d = Vasille.ref(4);
  const e = Vasille.ref(5);
  Vasille.watch(() => {
    const a = 1;
    const {
      b,
      c = 2,
      ...d
    } = {
      b: 3
    };
    const [e] = [1];

    // all variables must be ignored
    console.log(a, b, c, d, e);
  });
}, "VasilleDX:C");
