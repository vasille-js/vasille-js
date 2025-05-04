import { awaited, compose } from "vasille-explicit";

export const C = compose(() => {
  const [err, data] = awaited(new Promise(rv => rv(2)));

  console.log(err.$, data.$);
});
