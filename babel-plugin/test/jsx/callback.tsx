import { compose } from "vasille-web";

const C = compose(() => {
  <div
    callback={div => {
      console.log(div);
    }}
  />;
});
