import { theme, styleSheet } from "steel-frame";

const s = styleSheet({
  c1: {
    margin: [theme("t1", theme("t2", 0))],
  },
});
