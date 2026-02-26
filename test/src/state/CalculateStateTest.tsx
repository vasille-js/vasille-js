import { calculate, beforeMount, component } from "steel-frame";

export let control: { setValue(value: string): void } | undefined = undefined;

export const CalculateStateTest = component(() => {
  let $r = "test";
  const $text = calculate(() => {
    return "+" + $r;
  });

  beforeMount(() => {
    control = {
      setValue(value: string) {
        $r = value;
      },
    };
  });

  <div>Hello {$text}!</div>;
});
