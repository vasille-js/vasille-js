import { compose, bridge } from "vasille-web";

const r = bridge.ref("test");
const text = bridge.bind('+' + bridge.value(r));

export const control = {
  setValue(value: string) {
    bridge.setValue(r, value);
  }
};

export const Component = compose(() => {
  <div>
    Hello {text}!
  </div>;
});

