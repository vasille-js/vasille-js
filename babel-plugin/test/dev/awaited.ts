import { awaited, component } from "steel-frame";

const C = component(() => {
  const [$err, $data] = awaited(async () => {
    return 1;
  });
});
