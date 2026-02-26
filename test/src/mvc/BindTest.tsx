import { bind, component, ref, view } from "steel-frame";

let $r = ref("test");
const $text = bind("+" + $r);

export const control = {
  setValue(value: string) {
    $r = value;
  },
};

export const BindTest = component(() => {
  <div>Hello {$text}!</div>;
});
