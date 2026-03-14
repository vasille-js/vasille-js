import { component, Slot } from "vasille-shadow";
export const SlotTest = component((Vasille, {
  slot,
  beforeSlot,
  ...props
}) => {
  Vasille.tag("div", {}, Vasille => {
    Vasille.tag("div", {
      a: {
        class: "before"
      }
    }, Vasille => {
      Slot({
        model: beforeSlot
      }, Vasille, Vasille => Vasille.tag("slot", {
        a: {
          name: "beforeSlot"
        }
      }));
    });
    Slot({
      model: slot
    }, Vasille, Vasille => Vasille.tag("slot", {}, Vasille => {
      Vasille.tag("div", {
        a: {
          class: "default"
        }
      });
    }));
    Vasille.tag("div", {
      a: {
        class: "after"
      }
    }, Vasille => {
      Slot({
        model: props?.afterSlot
      }, Vasille, Vasille => Vasille.tag("slot", {
        a: {
          name: "afterSlot"
        }
      }));
    });
  });
}, "slot-test", {});