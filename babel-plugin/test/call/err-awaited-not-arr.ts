import { awaited, compose } from "steel-frame";

const C = compose(() => {
  const c = awaited(new Promise(resolve => setTimeout(resolve, 0)));
});
