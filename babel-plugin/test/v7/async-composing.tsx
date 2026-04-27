import { awaited, compose } from "steel-frame";

const C = compose(() => {
  const [$err, $data] = awaited(() => new Promise(resolve => resolve(1)));

  <C />;
});
