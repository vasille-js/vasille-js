import { awaited, compose } from "vasille-dx";
export const C = compose(function VasilleDX_C() {
  const [err, data] = awaited(this, new Promise(rv => rv(2)));
  console.log(err.$, data.$);
});