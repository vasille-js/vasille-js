import { styleSheet } from "vasille-web";

const s = styleSheet({
  c: {
    // @ts-expect-error
    ":hover": [23],
  },
});
