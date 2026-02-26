import { component, ref, view } from "steel-frame";

let $text = ref("test");

export let control: { setValue(value: string): void } | undefined = {
  setValue(value: string) {
    $text = value;
  },
};

export const RefTest = component(() => {
  <div>Hello {$text}!</div>;
});
