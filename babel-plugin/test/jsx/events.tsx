import { compose } from "vasille-web";

export const C = compose(() => {
  let $a = "a";

  <div
    onclick={[
      ev => {
        ev.stopPropagation();
      },
      { once: true },
    ]}
    onmousedown={function a(ev) {
      console.log(ev.clientX);
    }}
  />;
});
