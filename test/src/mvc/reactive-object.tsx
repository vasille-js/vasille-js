import { bridge, compose } from "vasille-web";

const data = bridge.reactiveObject({text: "test"});

export const control = {
  setValue(value: string) {
    bridge.setValue(data.text, value);
  }
};

export const Component = compose(() => {
  <div>
    Hello {data.text}!
  </div>;
});

