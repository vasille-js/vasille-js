import { styleSheet } from "vasille-web";

const styles = styleSheet({
  h1: {
    "font-size": 35,
    "letter-spacing": "-3%",
    "line-height": "1.10",
    "text-transform": "uppercase",
    margin: [0, 0, 12],
  },
  description: {
    "font-size": 15,
    "line-height": "120%",
    "letter-spacing": "-2%",
    "margin-bottom": 18,
  },
  centerText: {
    "text-align": "center",
  },
});

export const h1 = styles.h1;
export const description = styles.description;
export const centerText = styles.centerText;
