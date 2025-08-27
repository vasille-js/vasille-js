import { beforeMount, component } from "vasille-web";

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
