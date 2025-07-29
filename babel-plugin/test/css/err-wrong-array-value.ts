import { styleSheet } from "vasille-web";

const s = styleSheet({
  c: {
    // @ts-expect-error
    margin: [["", ""]],
  },
});
