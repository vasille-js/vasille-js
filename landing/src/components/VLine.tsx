import { component, dark, styleSheet } from "vasille-web";

interface Props {
  reverse?: boolean;
}

export const VLine = component(({ reverse }: Props) => {
  <div class={[styles.line]}>
    <div
      class={[styles.inner, styles.light]}
      style={reverse ? "bottom:0" : "top:0"}
    />
    <div
      class={[styles.inner, styles.dark]}
      style={reverse ? "top:0" : "bottom:0"}
    />
  </div>;
});

const styles = styleSheet({
  line: {
    display: "flex",
    width: 1,
    "align-items": "stretch",
    position: "relative",
    flex: "1",
  },
  inner: {
    position: "absolute",
    left: 0,
    right: 0,
    transition: "height 5s ease-in-out",
  },
  light: {
    height: ["100%", dark(0)],
    "background-color": "#B2B2B2",
  },
  dark: {
    height: [0, dark("100%")],
    "background-color": "#4D4D4D",
  },
});
