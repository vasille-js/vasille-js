import { component, dark, Slot, styleSheet } from "steel-frame";
import { MAX_WIDTH } from "./limits.js";

export const Row = component((props: { slot(): void; class?: string }) => {
  <div
    class={[styles.row, props.class ?? "noop"]}
    style={{ "max-width": MAX_WIDTH }}
  >
    <Slot model={props.slot} />
  </div>;
});

const styles = styleSheet({
  row: {
    display: "flex",
    width: "100%",
    "background-color": [dark("#212121"), "#fdfdfd"],
    "border-radius": 16,
    transition: "background-color 0.2s ease-in-out",
  },
});
