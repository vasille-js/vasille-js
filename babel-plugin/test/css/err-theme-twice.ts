import { theme, styleSheet } from "vasille-web";

const s = styleSheet({
  c1: {
    margin: [theme("t1", theme("t2", 0))],
  },
});
