import { view, bridge } from "vasille-web";

const r = bridge.ref("test");
const text = bridge.bind('+' + bridge.value(r));

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

