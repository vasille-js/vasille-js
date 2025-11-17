import { awaited, component } from "vasille-web";

const C = component(() => {
  const [$err, $data] = awaited(async () => {
    return 1;
  });
});
