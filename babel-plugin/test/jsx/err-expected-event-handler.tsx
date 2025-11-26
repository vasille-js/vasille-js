import { compose } from "steel-frame";

const C = compose(() => {
  // @ts-expect-error
  <div onclick />;
});
