import { component, ref, store, view } from "vasille-web";

const modelStore = store(() => {
  let $text = ref("test");

  return {
    $text,
    setValue(value: string) {
      $text = value;
    },
  };
});

const Component = component(() => {
  <div>Hello {modelStore.$text}!</div>;
});

export const x = { model: modelStore, Component };
