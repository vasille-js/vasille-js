import { component, Slot, styleSheet } from "vasille-web";
import { DoubleTitle } from "../DoubleTitle.js";
import { DoubleDataProps } from "../../interfaces/double-data.js";

export const FeatureTitle = component(({ slot, content }: DoubleDataProps) => {
  <DoubleTitle
    title={(props) => {
      <h2 class={[...props.classes, styles.h2]}>
        <Slot model={content ?? slot} {...props} />
      </h2>;
    }}
  />;
});

const styles = styleSheet({
  h2: {
    margin: [12, 0],
    "text-transform": "uppercase",
  },
});
