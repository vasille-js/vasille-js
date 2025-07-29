import { compose } from "vasille-web";

const C = compose(() => {
  // @ts-expect-error
  <div space:fail />;
});
