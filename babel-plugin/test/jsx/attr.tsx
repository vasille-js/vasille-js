import { compose } from "vasille-web";

const C = compose(() => {
  let $a = "a";

  <div dir="ltr" data-let={$a} contenteditable />;
});
