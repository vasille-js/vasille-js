import { store, bridge, view } from "vasille-web";

export const model = store(() => {
  let $r = "test";
  let text = bridge.stored($r);

  return {
    $r,
    text,
    setValue(value: string) {
      $r = value;
    },
  };
})();

export const Component = view(() => {
  <div>Hello {model.text}!</div>;
});
