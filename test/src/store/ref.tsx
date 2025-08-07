import { ref, store, view } from "vasille-web";

export const model = store(() => {
  let $text = ref("test");

  return {
    $text,
    setValue(value: string) {
      ($text = value);
    },
  }
})()

export const Component = view(() => {
  <div>Hello {model.$text}!</div>;
});
