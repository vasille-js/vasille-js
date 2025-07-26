import { compose } from "vasille-dx";

export const C = compose(() => {
  // @ts-expect-error
  <xml:div></xml:div>;
});
