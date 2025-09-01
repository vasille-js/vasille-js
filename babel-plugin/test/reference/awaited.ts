import { awaited, beforeMount, compose } from "vasille-web";

const C = compose(() => {
  const [$err, $data] = awaited(new Promise(rv => rv(2)));

  beforeMount(() => console.log($err, $data));
});
