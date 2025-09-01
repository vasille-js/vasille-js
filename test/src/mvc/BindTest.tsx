import { bind, component, ref, view } from "vasille-web";

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
