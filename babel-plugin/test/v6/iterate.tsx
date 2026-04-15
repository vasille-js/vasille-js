import { compose, ForEach, Iterate } from "steel-frame";

const C = compose(() => {
  const arr = [1, 2, 3];

  <Iterate
    value={arr}
    slot={number => {
      <div>{number}</div>;
    }}
  />;
  <ForEach
    value={arr}
    slot={(item, index) => {
      <div>{item + index}</div>;
    }}
  />;
  <Iterate value={arr} slot={item => item + 1} />;
});
