import { component, dark, Slot, styleSheet } from "steel-frame";

interface Props {
  slot?(): void;
}

export const FeatureKey = component(({ slot }: Props) => {
  <div class={styles.row}>
    <div class={styles.circle} />
    <div class={styles.text}>
      <Slot model={slot} />
    </div>
  </div>;
});

const styles = styleSheet({
  row: {
    display: "flex",
    "align-items": "center",
  },
  circle: {
    width: 12,
    height: 12,
    "border-radius": 6,
    "background-color": ["#e10000", dark("#ff946a")],
    transition: "background-color 0.2s ease-in-out",
    "margin-right": 8,
  },
  text: {
    "font-size": 12,
    height: 13,
    "letter-spacing": "-0.24px",
    "text-transform": "uppercase",
    color: ["#191919", dark("#fff")],
    transition: "color 0.2s ease-in-out",
  },
});
