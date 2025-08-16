import { compose } from "vasille-web";

export const C = compose(() => {
  let $a = "a";

  <div dir="ltr" data-let={$a} contenteditable />;
});
