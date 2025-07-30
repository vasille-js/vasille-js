import { awaited, compose } from "vasille-web";

const C = compose(() => {
  const c = awaited(new Promise(resolve => setTimeout(resolve, 0)));
});
