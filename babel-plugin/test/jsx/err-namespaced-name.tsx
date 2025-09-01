import { compose } from "vasille-web";

const C = compose(() => {
  // @ts-expect-error
  <xml:div></xml:div>;
});
