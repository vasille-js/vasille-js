import { compose, ensure as VasilleEnsure } from "vasille-web";
const o1 = {};
const o2 = null;
const C = compose(Vasille => {
  const $a1 = VasilleEnsure(o1, "$a");
  // @ts-expect-error
  const $a2 = VasilleEnsure(o2, "$a");
});