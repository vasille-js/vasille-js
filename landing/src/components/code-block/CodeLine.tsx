import { component, dark, Slot, styleSheet } from "steel-frame";

interface Props {
  number: number;
  content(props: { isDark: boolean }): void;
}

export const CodeLine = component<Props>(({ content, number }) => {
  const reverse = number % 2 === 0;

  <div class={styles.line}>
    <div
      class={[styles.inner, styles.placeholder, reverse && styles.placeholderR]}
    >
      <div class={styles.lineNumber}>{number}</div>
      <div class={[styles.text, reverse ? styles.light : styles.dark]}>
        <Slot model={content} isDark={!reverse} />
      </div>
    </div>
    <div class={[styles.inner, styles.abs, reverse && styles.absR]}>
      <div class={styles.lineNumber}>{number}</div>
      <div class={[styles.text, reverse ? styles.dark : styles.light]}>
        <Slot model={content} isDark={reverse} />
      </div>
    </div>
  </div>;
});

const styles = styleSheet({
  line: {
    overflow: "hidden",
    "white-space": "pre-wrap",
    "font-family": "FM, monospace",
    "font-size": 14,
    width: "fit-content",
    position: "relative",
  },
  abs: {
    height: "100%",
    top: [0, dark("100%")],
    position: "absolute",
    transition: "top 2s ease-in-out 0.2s",
  },
  absR: {
    top: ["-100%", dark("0")],
  },
  placeholder: {
    opacity: ["0", dark("1")],
    transition: "opacity 2s ease-in-out 0.2s",
  },
  placeholderR: {
    opacity: ["1", dark("0")],
  },
  inner: {
    display: "flex",
  },
  lineNumber: {
    width: 20,
    "text-align": "right",
    color: "#80808080",
    "margin-right": 10,
  },
  text: {
    display: "flex",
  },
  dark: {
    color: "#f2f2f2",
  },
  light: {
    color: "#191919",
  },
});
