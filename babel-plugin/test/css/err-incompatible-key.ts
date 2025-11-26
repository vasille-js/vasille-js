import { styleSheet } from "steel-frame";

const c = "v";
const s = styleSheet({
  c: {
    // @ts-expect-error
    [true]: "23px",
  },
});
