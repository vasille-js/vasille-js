import { awaited, compose } from "vasille-web";
export const C = compose(Vasille => {
  const [err, data] = awaited(Vasille, new Promise(rv => rv(2)), "err", "data");
  console.log(err.$, data.$);
}, "VasilleWeb:C");
