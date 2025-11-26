import { compose } from "steel-frame";

const C = compose(() => {
  let $class = "name";

  <div
    callback={div => {
      div.className = $class;
    }}
  />;
});
