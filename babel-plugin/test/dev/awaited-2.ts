import { awaited, component } from "vasille-web";

const C = component(() => {
  const [] = awaited(async () => {
    return 1;
  });
});
