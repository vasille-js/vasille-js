import { compose, If } from "steel-frame";

const C = compose(() => {
  <If {...{ $condition: true }} />;
});
