import { For, compose } from "steel-frame";

const C = compose(() => {
  const a = [1, 2, 3];
  const map = new Map([["x", 1]]);

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
