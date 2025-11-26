import { compose } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  <xml:div></xml:div>;
});
