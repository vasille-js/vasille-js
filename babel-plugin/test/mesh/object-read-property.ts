import { compose } from "steel-frame";

const key = "key";

const C = compose(() => {
  const o = {
    [key]: 1,
  };
  const a = o[key];
  const $b = o[key];

  function f() {
    console.log(o[key]);
  }
});
