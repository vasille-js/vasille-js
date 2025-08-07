import { store, view, watch } from "vasille-web";

export const model = store(() => {
  let $name = "Vasille";
  let $external = "test";

  watch(() => {
    ($name = "+" + ($external));
  });

  return {
    $name,
    $external,
    setValue(value: string) {
      ($external = value);
    },
  }
})()

export const Watch = view(() => {
  <div>Hello {model.$name}!</div>;
});
