import { component, Slot, styleSheet } from "steel-frame";
import { MAX_WIDTH } from "./limits.js";

export const Row = component((props: { slot(): void }) => {
  <div class={styles.row} style={{ "max-width": MAX_WIDTH }}>
    <Slot model={props.slot} />
  </div>;
});

const styles = styleSheet({
  row: {
    display: "flex",
    width: "100%",
  },
});
