import { beforeMount, component } from "steel-frame";

export let control: { setValue(value: string): void } | undefined = undefined;

export const BindStateTest = component(() => {
  let $r = "test";
  const $text = "+" + $r;

  beforeMount(() => {
    control = {
      setValue(value: string) {
        $r = value;
      },
    };
  });

  <div>Hello {$text}!</div>;
});
