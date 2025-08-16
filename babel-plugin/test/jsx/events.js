import { compose, ref as VasilleRef } from "vasille-web";
export const C = compose(Vasille => {
  const $a = VasilleRef("a", "a");
  Vasille.tag("div", {
    events: {
      click: [ev => {
        ev.stopPropagation();
      }, {
        once: true
      }],
      mousedown: function a(ev) {
        console.log(ev.clientX);
      }
    }
  });
}, "C");
