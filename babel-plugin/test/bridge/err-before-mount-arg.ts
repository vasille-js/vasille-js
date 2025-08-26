import { beforeMount, compose } from "vasille-web";

const C = compose(() => {
  // @ts-expect-error
  beforeMount();
});
