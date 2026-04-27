import { awaited, compose } from "vasille-web";
const C = compose(async Vasille => {
  const [$err, $data] = await awaited(() => new Promise(resolve => resolve(1)), Vasille);
  await C({}, Vasille);
});