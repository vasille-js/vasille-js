import { calculate, component, ref, view } from "vasille-web";

let $r = ref("test");
const $text = calculate(() => {
  return "+" + $r;
});

export const control = {
  setValue(value: string) {
    $r = value;
  },
};

export const CalculateTest = component(() => {
  <div>Hello {$text}!</div>;
});
