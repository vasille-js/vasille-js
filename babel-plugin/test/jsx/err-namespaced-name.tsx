import { compose } from "vasille-web";

export const C = compose(() => {
  // @ts-expect-error
  <xml:div></xml:div>;
});
