import { component, store, view, watch } from "vasille-web";

const modelStore = store(() => {
  let $name = "Vasille";
  let $external = "test";

  watch(() => {
    $name = "+" + $external;
  });

  return {
    $name,
    $external,
    setValue(value: string) {
      $external = value;
    },
  };
});

const Watch = component(() => {
  <div>Hello {modelStore.$name}!</div>;
});

export const x = { Watch, model: modelStore };
