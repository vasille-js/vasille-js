import { component, mobile, Slot, styleSheet, tablet } from "steel-frame";
import { VLine } from "../VLine.js";
import { MAX_WIDTH } from "../code-block/lib/limits.js";

interface Props {
  reverse?: boolean;
  slot(): void;
}

export const FeatureRow = component<Props>(({ reverse, slot }) => {
  <div
    class={styles.row}
    style={{
      "flex-direction": reverse ? "row-reverse" : "row",
      "max-width": MAX_WIDTH + 20,
    }}
  >
    <div
      class={[styles.cell, styles.left]}
      style={{
        "padding-left": reverse ? 16 : 10,
      }}
    >
      <Slot model={slot} />
    </div>
    <div class={styles.delimiter}>
      <VLine />
    </div>
    <div
      class={[styles.cell, styles.right]}
      style={{
        "padding-left": reverse ? 16 : 10,
      }}
    />
  </div>;
});

const styles = styleSheet({
  row: {
    display: "flex",
    "align-items": "stretch",
    flex: "1",
    width: "100%",
    "box-sizing": "border-box",
    padding: [0, tablet([0, 20]), mobile([0, 10])],
  },
  cell: {
    padding: [60, 10, 20],
    "max-width": [522, tablet(mobile(1024))],
    "box-sizing": "border-box",
    flex: "1",
  },
  delimiter: {
    "flex-direction": "row",
    width: 1,
    display: ["flex", tablet(mobile("none"))],
  },
  left: {
    "padding-right": 10,
  },
  right: {
    "padding-left": 10,
    display: ["block", tablet(mobile("none"))],
  },
});
