import { view, store, calculate } from "vasille-web";

export const model = store(() => {
  let $r = "test";
  let $text = calculate(() => {
    return "+" + $r;
  })

  return {
    $r, $text,
    setValue(value: string) {
      $r = value
    },
  }
})()

export const Component = view(() => {
  <div>Hello {model.$text}!</div>;
});
