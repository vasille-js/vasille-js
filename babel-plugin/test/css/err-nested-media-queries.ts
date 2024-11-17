import { webStyleSheet } from "vasille-css";

const s = webStyleSheet({
  c: {
    '@media (max-width: 1000px)': {
      '@media (min-width: 200px)': {}
    }
  }
})
