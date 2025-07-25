import { compose } from "vasille-dx";
export const C = compose(Vasille => {
  const a = Vasille.ref("a");
  Vasille.tag("div", {
    events: {
      click: ev => {
        ev.stopPropagation();
      },
      mousedown: function a(ev) {
        console.log(ev.clientX);
      }
    }
  });
}, "VasilleDX:C");
