import { styleSheet } from "steel-frame";

const styles = styleSheet({
  h1: {
    "font-size": 35,
    "letter-spacing": "-1.05px",
    "line-height": "1.10",
    "text-transform": "uppercase",
    margin: [0, 0, 12],
  },
  description: {
    "font-size": 15,
    "line-height": "120%",
    "letter-spacing": "-0.3px",
    "margin-bottom": 18,
  },
  centerText: {
    "text-align": "center",
  },
});

export const h1 = styles.h1;
export const description = styles.description;
export const centerText = styles.centerText;
