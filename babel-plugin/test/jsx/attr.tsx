import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = "a";

  <div dir="ltr" data-let={a} />;
});
