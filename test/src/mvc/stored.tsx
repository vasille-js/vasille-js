import { bridge, compose } from "vasille-web";

const r = bridge.ref("test");
const text = bridge.stored(r);

export const control = {
  setValue(value: string) {
    bridge.setValue(r, value)
  }
};

export const Component = compose(() => {
  <div>
    Hello {text}!
  </div>;
});

