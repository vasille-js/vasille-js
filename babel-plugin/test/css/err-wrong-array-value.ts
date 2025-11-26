import { styleSheet } from "steel-frame";

const s = styleSheet({
  c: {
    // @ts-expect-error
    margin: [["", ""]],
  },
});
