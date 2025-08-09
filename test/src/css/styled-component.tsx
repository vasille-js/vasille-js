import { view, styleSheet, dark, theme, mobile, tablet, laptop, prefersDark, prefersLight } from "vasille-web";

export const StyledComponent = view(() => {
  <div class={styles.common}></div>;
  <div class={styles.dark}></div>;
  <div class={styles.theme}></div>;
  <div class={styles.prefersLight}></div>;
  <div class={styles.prefersDark}></div>;
  <div class={styles.mobile}></div>;
  <div class={styles.tablet}></div>;
  <div class={styles.laptop}></div>;
});

const styles = styleSheet({
  common: {
    margin: 5,
    padding: [10, 5],
    display: "block",
  },
  dark: {
    background: ["white", dark("black")],
  },
  theme: {
    background: ["white", theme("red", "red"), theme("green", "green")],
  },
  prefersLight: {
    background: ["grey", prefersLight("white")],
  },
  prefersDark: {
    background: ["grey", prefersDark("black")],
  },
  mobile: {
    margin: [5, mobile(10)],
  },
  tablet: {
    margin: [5, tablet(10)],
  },
  laptop: {
    margin: [5, laptop(10)],
  },
});
