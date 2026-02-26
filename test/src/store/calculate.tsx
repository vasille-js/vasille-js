import { view, store, calculate, component } from "steel-frame";

const modelStore = store(() => {
  let $r = "test";
  let $text = calculate(() => {
    return "+" + $r;
  });

  return {
    $r,
    $text,
    setValue(value: string) {
      $r = value;
    },
  };
});

const Component = component(() => {
  <div>Hello {modelStore.$text}!</div>;
});

export const x = { model: modelStore, Component };
