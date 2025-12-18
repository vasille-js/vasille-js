import { dark, styleSheet, view } from "vasille-web";
import { VLine } from "../components/VLine.js";
import { DoubleTitle } from "../components/DoubleTitle.js";
import { centerText, description, h1 } from "../style/text.js";
import { DoubleDescription } from "../components/DoubleDescription.js";

export const DescriptionView = view(() => {
  <div class={styles.center}>
    <div class={[styles.line, styles.center]} style={{ "margin-bottom": 40 }}>
      <VLine />
    </div>
    <DoubleTitle
      title={({ classes, isDark }) => {
        const color = isDark ? "#ff946a" : "#0302DF";

        <h2
          class={[h1, centerText, ...classes]}
          style={{ "max-width": 1000, "text-transform": "none" }}
        >
          SteelFrame is a Web Dev Kit that prioritizes{" "}
          <span style={{ color }}>safety</span>,{" "}
          <span style={{ color }}>predictability</span>, and{" "}
          <span style={{ color }}>developer experience</span>.
        </h2>;
      }}
    />
    <DoubleDescription
      description={({ classes, isDark }) => {
        <div
          class={[description, centerText, ...classes]}
          style={{ "max-width": 800 }}
        >
          Unlike frameworks with asynchronous reactivity models, SteelFrame
          updates the DOM synchronously when reactive values change. When a line
          of code executes, the DOM is already in sync. This eliminates entire
          classes of timing-related bugs.
        </div>;
      }}
    />
    <div class={[styles.line, styles.center]} style={{ "margin-top": 22 }}>
      <VLine reverse />
    </div>
  </div>;
});

const styles = styleSheet({
  center: {
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
  },
  line: {
    height: 40,
  },
});
