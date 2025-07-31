import * as V from "vasille-web";

const S = V.store(() => {
  const [err, value] = V.awaited(new Promise(resolve => setTimeout(resolve, 1000)));

  return {};
});
