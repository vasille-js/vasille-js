import { awaited, compose } from "vasille-web";

export const C = compose(() => {
  const [err, data] = awaited(new Promise(rv => rv(2)));

  console.log(err, data);
});
