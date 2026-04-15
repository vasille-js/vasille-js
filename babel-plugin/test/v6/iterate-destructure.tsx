import { compose, ForEach, Iterate } from "steel-frame";

const C = compose(() => {
  const arr = [{ x: 1 }];

  <Iterate
    value={arr}
    slot={({ x }) => {
      <div>{x}</div>;
    }}
  />;
  <ForEach
    value={arr}
    slot={({ x }, index) => {
      <div>{x + index}</div>;
    }}
  />;
});
