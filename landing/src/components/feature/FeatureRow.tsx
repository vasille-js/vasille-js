import { component, Slot, styleSheet } from "steel-frame";
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
      "max-width": MAX_WIDTH,
    }}
  >
    <div
      class={[styles.cell, styles.left]}
      style={{ "padding-left": reverse ? 16 : 0 }}
    >
      <Slot model={slot} />
    </div>
    <div class={styles.delimiter}>
      <VLine />
    </div>
    <div class={[styles.cell, styles.right]} />
  </div>;
});

const styles = styleSheet({
  row: {
    display: "flex",
    "align-items": "stretch",
    flex: "1",
    width: "100%",
    "content-visibility": "auto",
    "contain-intrinsic-size": "200px",
  },
  cell: {
    padding: [60, 0, 20],
    "max-width": 512,
    "box-sizing": "border-box",
    flex: "1",
  },
  delimiter: {
    display: "flex",
    "flex-direction": "row",
    width: 1,
  },
  left: {
    "padding-right": 10,
  },
  right: {
    "padding-left": 10,
  },
});
