import { beforeMount, compose } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  beforeMount();
});
