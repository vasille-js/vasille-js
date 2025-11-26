import { styleSheet } from "steel-frame";

const s = styleSheet({
  c: {
    // @ts-expect-error
    "@media (max-width: 100px)": [23],
  },
});
