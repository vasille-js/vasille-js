import { awaited, compose, safe as VasilleSafe } from "vasille-web";
const C = compose(Vasille => {
  const [$err, $data] = awaited(new Promise(rv => rv(2)));
  VasilleSafe(() => console.log($err.V, $data.V))();
});
