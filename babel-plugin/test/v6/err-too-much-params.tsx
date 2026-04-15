import { ArrayView, compose } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  <ArrayView $of={[]} slot={function (x, y, z) {}} />;
});
