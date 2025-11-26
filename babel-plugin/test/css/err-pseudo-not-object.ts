import { styleSheet } from "steel-frame";

const s = styleSheet({
  c: {
    // @ts-expect-error
    ":hover": [23],
  },
});
