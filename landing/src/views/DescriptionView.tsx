import { dark, styleSheet, view } from "steel-frame";
import { VLine } from "../components/VLine.js";
import { DoubleTitle } from "../components/DoubleTitle.js";
import {
  blueLight,
  centerText,
  description,
  h1,
  orangeDark,
} from "../style/text.js";
import { DoubleDescription } from "../components/DoubleDescription.js";
import { HLine } from "../components/HLine.js";

export const DescriptionView = view(() => {
  <HLine />;
  <div class={styles.center}>
    <VLine height={40} marginBottom={40} />
    <DoubleTitle
      title={({ classes, isDark }) => {
        const className = isDark ? orangeDark : blueLight;

        <h2
          class={[h1, centerText, ...classes]}
          style={{ "max-width": 1000, "text-transform": "none" }}
        >
          SteelFrame is a Web Dev Kit that prioritizes{" "}
          <span class={className}>safety</span>,{" "}
          <span class={className}>predictability</span>, and{" "}
          <span class={className}>developer experience</span>.
        </h2>;
      }}
    />
    <DoubleDescription
      description={({ classes, isDark }) => {
        <div
          class={[description, centerText, ...classes]}
          style={{ "max-width": 800 }}
        >
          Dev Kit straight points are: fault-tolerance out of the box,
          compile-time checks, synchronous reactive updates, fine-grained
          reactivity, strong web standards and focus on maintenance.
        </div>;
      }}
    />
    <VLine height={40} marginTop={22} reverse />
  </div>;
  <HLine />;
});

const styles = styleSheet({
  center: {
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
    padding: [0, 20],
  },
  line: {
    height: 40,
  },
});
