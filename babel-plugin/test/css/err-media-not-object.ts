import { styleSheet } from "vasille-web";

const s = styleSheet({
  c: {
    // @ts-expect-error
    "@media (max-width: 100px)": [23],
  },
});
