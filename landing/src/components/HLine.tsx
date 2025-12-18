import { component, dark, styleSheet } from "vasille-web";

export const HLine = component(() => {
  <div class={[styles.line]}>
    <div class={[styles.inner, styles.light]} style={{ left: "50%" }} />
    <div class={[styles.inner, styles.light]} style={{ right: "50%" }} />
    <div class={[styles.inner, styles.dark]} style={{ left: 0 }} />
    <div class={[styles.inner, styles.dark]} style={{ right: 0 }} />
  </div>;
});

const styles = styleSheet({
  line: {
    display: "flex",
    height: 1,
    "align-items": "stretch",
    position: "relative",
  },
  inner: {
    position: "absolute",
    top: 0,
    bottom: 0,
    transition: "width 10s ease-in-out",
  },
  light: {
    width: ["50%", dark(0)],
    "background-color": "#B2B2B2",
  },
  dark: {
    width: [0, dark("50%")],
    "background-color": "#4D4D4D",
  },
});
