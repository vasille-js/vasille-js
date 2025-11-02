import { component, Slot, ref as VasilleRef, safe as VasilleSafe } from "vasille-web";
export let control = undefined;
export const xes = [];
const SubComponent = component((Vasille, {
  slot,
  slot1,
  slot2
}) => {
  const $x = VasilleRef(0, "x");
  VasilleSafe(() => {
    if (slot1) {
      control = {
        setX(_x) {
          $x.V = _x;
        }
      };
    }
  })();
  Slot({
    model: slot
  }, Vasille);
  Slot({
    model: slot1,
    x: $x.V
  }, Vasille, Vasille => {
    Vasille.tag("div", {}, Vasille => {
      Vasille.text("slot 1 default");
    });
  });
  Slot({
    model: slot2,
    x: 3
  }, Vasille);
}, "SubComponent");
export const SlotTest = component(Vasille => {
  Vasille.tag("div", {}, Vasille => {
    SubComponent({}, Vasille);
  });
  Vasille.tag("div", {}, Vasille => {
    SubComponent({}, Vasille, (_VasilleWeb, Vasille) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text("child");
      });
    });
  });
  Vasille.tag("div", {}, Vasille => {
    SubComponent({
      slot1: ({
        x
      }, Vasille) => {
        VasilleSafe(() => xes.push(x))();
        Vasille.tag("div", {}, Vasille => {
          Vasille.text("child");
          Vasille.text(x);
        });
      }
    }, Vasille);
  });
  Vasille.tag("div", {}, Vasille => {
    SubComponent({
      slot2: ({
        x
      }, Vasille) => {
        VasilleSafe(() => xes.push(x))();
        Vasille.tag("div", {}, Vasille => {
          Vasille.text("child");
          Vasille.text(x);
        });
      }
    }, Vasille);
  });
}, "SlotTest");
