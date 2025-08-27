import { awaited, compose } from "vasille-web";
const C = compose(Vasille => {
  const [$err, $data] = awaited(new Promise(rv => rv(2)), Vasille, "err", "data");
  console.log($err.V, $data.V);
}, "C");
