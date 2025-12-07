import { compose, ref as VasilleRef } from "vasille-web";
const C = compose(Vasille => {
  const $a = VasilleRef("a");
  Vasille.tag("div", {
    e: {
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
});
