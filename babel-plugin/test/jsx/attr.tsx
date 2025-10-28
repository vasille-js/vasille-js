import { compose } from "vasille-web";

const C = compose(() => {
  let $a = "a";
  let $b = 1;

  <div dir="ltr" data-let={$a} data-derived={$b + 1} contenteditable />;
});
