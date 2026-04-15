import { compose, ForEach, Iterate } from "steel-frame";

const C = compose(() => {
  const map = new Map([[1, 2]]);

  <Iterate
    value={map}
    slot={([key, value]) => {
      <div>{key + value}</div>;
    }}
  />;
});
