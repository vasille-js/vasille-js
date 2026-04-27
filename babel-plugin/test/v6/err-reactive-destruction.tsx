import { ArrayView, compose } from "steel-frame";

const C = compose(() => {
  const model = [{ x: 1 }];
  <ArrayView $of={model} slot={({ x }) => 0} key={item => item.x} />;
});
