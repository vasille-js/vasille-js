import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = "a";

  <div
    onclick={ev => {
      ev.stopPropagation();
    }}
    onmousedown={function a(ev) {
      console.log(ev.clientX);
    }}
  />;
});
