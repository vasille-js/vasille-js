import { component, dark, mobile, Slot, styleSheet, tablet } from "steel-frame";
import { MAX_WIDTH } from "./limits.js";

export const Row = component((props: { slot(): void; class?: string }) => {
  <div class={styles.container}>
    <div class={[styles.row, props.class ?? "noop"]}>
      <Slot model={props.slot} />
    </div>
  </div>;
});

const styles = styleSheet({
  row: {
    display: "flex",
    width: "100%",
    "background-color": [dark("#212121"), "#fdfdfd"],
    "border-radius": 16,
    transition: "background-color 0.2s ease-in-out",
    "box-sizing": "border-box",
    "justify-content": "center",
    margin: [0, "auto"],
    "max-width": [
      1025,
      tablet("calc(100vw - 157px)"),
      mobile("calc(100vw - 20px)"),
    ],
  },
  container: {
    width: "100%",
    padding: [[0, 20], mobile([0, 10])],
    "box-sizing": "border-box",
    display: "flex",
    "flex-direction": "column",
    "align-items": "stretch",
  },
});
