import { For, compose, arrayModel, mapModel } from "steel-frame";

const C = compose(() => {
  const a = arrayModel([1, 2, 3]);
  const map = mapModel([["x", 1]]);

  <For
    of={a}
    slot={value => {
      <>{value}</>;
    }}
  />;
  <For
    of={map}
    slot={(value, key) => {
      console.log(value, key);
    }}
  />;
});
