import { theme, webStyleSheet } from "vasille-css";

const s = webStyleSheet({
  c1: {
    margin: [theme("t1", theme("t2", 0))]
  }
})
