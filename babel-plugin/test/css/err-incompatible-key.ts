import { styleSheet } from "vasille-web";

const c = "v";
const s = styleSheet({
  c: {
    // @ts-expect-error
    [true]: "23px",
  },
});
