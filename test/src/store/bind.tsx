import { view, store, bind } from "vasille-web";

export const model = store(() => {
  let $r = "test";
  const $text = bind("+" + $r);

  return {
    $r, $text,
    setValue(value: string) {
      ($r = value);
    },
  }
})()

export const Component = view(() => {
  <div>Hello {model.$text}!</div>;
});
