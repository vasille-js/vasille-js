import { view, store, bind, component } from "vasille-web";

const modelStore = store(() => {
  let $r = "test";
  const $text = bind("+" + $r);

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
