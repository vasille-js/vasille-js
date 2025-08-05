import { bridge, compose } from "vasille-web";

const text = bridge.ref("test");

export let control: { setValue(value: string): void; } | undefined = {
  setValue(value: string) {
    bridge.setValue(text, value);
  }
};

export const Component = compose(() => {
  <div>
    Hello {text}!
  </div>;
});

