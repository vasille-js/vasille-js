import { webStyleSheet } from "vasille-css";

const c = "v";
const s = webStyleSheet({
  c: {
    // @ts-expect-error
    [true]: "23px",
  },
});
