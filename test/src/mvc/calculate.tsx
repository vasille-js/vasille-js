import { view, bridge } from "vasille-web";

const r = bridge.ref("test");
const text = bridge.calculate(() => {
  return '+' + bridge.value(r);
})

export const control = {
  setValue(value: string) {
    bridge.setValue(r, value);
  }
};

export const Component = view(() => {
  <div>
    Hello {text}!
  </div>;
});

