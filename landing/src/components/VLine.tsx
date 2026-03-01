import { component, dark, styleSheet } from "steel-frame";

interface Props {
  reverse?: boolean;
  height?: number;
  marginTop?: number;
  marginBottom?: number;
}

export const VLine = component(
  ({ reverse, height, marginBottom, marginTop }: Props) => {
    <div
      class={[styles.line]}
      style={{
        height,
        "margin-top": marginTop,
        "margin-bottom": marginBottom,
        flex: height ? "none" : "1",
      }}
    >
      <div
        class={[styles.inner, styles.light]}
        style={reverse ? "bottom:0" : "top:0"}
      />
      <div
        class={[styles.inner, styles.dark]}
        style={reverse ? "top:0" : "bottom:0"}
      />
    </div>;
  },
);

const styles = styleSheet({
  line: {
    width: 1,
    position: "relative",
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
