import { component, ref, view } from "vasille-web";

let $text = ref("test");

export let control: { setValue(value: string): void } | undefined = {
  setValue(value: string) {
    $text = value;
  },
};

export const RefTest = component(() => {
  <div>Hello {$text}!</div>;
});
