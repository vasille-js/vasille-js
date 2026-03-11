import { compose, match as VasilleMatch } from "vasille-web";
const key = "key";
const C = compose(Vasille => {
  const o = {
    [key]: VasilleMatch(key, 1)
  };
  const a = VasilleMatch("", o[key]);
  const $b = VasilleMatch("$", o[key]);
  function f() {
    console.log(VasilleMatch("", o[key]));
  }
});