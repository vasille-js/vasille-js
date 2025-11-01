import { compose } from "vasille-web";

const C = compose(() => {
  let $class = "name";

  <div
    callback={div => {
      div.className = $class;
    }}
  />;
});
