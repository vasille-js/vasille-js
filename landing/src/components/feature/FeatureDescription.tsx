import { component, Slot } from "steel-frame";
import { DoubleDataProps } from "../../interfaces/double-data.js";
import { DoubleDescription } from "../DoubleDescription.js";

export const FeatureDescription = component(
  ({ slot, content }: DoubleDataProps) => {
    <DoubleDescription
      description={(props) => {
        <div class={[...props.classes]}>
          <Slot model={content ?? slot} {...props} />
        </div>;
      }}
    />;
  },
);
