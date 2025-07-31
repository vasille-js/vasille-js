import { awaited, store } from "vasille-web";

const S = store(() => {
  const [err, value] = awaited(new Promise(resolve => setTimeout(resolve, 1000)));

  return {};
});
