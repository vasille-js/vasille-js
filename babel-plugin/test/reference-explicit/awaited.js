import { awaited, compose } from "vasille-explicit";
export const C = compose(function VasilleEX_C(Vasille) {
  const [err, data] = awaited(Vasille, new Promise(rv => rv(2)));
  console.log(err.$, data.$);
});