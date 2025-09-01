import { component, ref, view } from "vasille-web";

const data = { $text: ref("test") };

export const control = {
  setValue(value: string) {
    data.$text = value;
  },
};

export const ReactiveObjectTest = component(() => {
  <div>Hello {data.$text}!</div>;
});
