import { store, view } from "vasille-web";

export const model = store(() => {
  const $$obj = { text: "test" };

  return {
    $$obj,
    setValue(value: string) {
      ($$obj.text = value);
    },
  }
})()

export const Component = view(() => {
  <div>Hello {model.$$obj.text}!</div>;
});
