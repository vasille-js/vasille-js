import { webStyleSheet } from "vasille-css";

const s = webStyleSheet({
  // @ts-expect-error
  a() {},
});
