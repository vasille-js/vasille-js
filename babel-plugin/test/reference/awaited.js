import { awaited, compose } from "vasille-dx";
export const C = compose(function VasilleDX_C(Vasille) {
  const [err, data] = awaited(Vasille, new Promise(rv => rv(2)));
  console.log(err.$, data.$);
});