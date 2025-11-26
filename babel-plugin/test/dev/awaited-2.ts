import { awaited, component } from "steel-frame";

const C = component(() => {
  const [] = awaited(async () => {
    return 1;
  });
});
