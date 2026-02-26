import { component, store, view } from "steel-frame";

const modelStore = store(() => {
  const obj = { $text: "test" };

  return {
    obj: obj,
    setValue(value: string) {
      obj.$text = value;
    },
  };
});

const Component = component(() => {
  <div>Hello {modelStore.obj.$text}!</div>;
});

export const x = { model: modelStore, Component };
