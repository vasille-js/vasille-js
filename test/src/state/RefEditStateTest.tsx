import { beforeMount, component } from "vasille-web";

export let control: { setValue(value: string): void } | undefined = undefined;

export const RefEditStateTest = component(() => {
  let $text = "test";

  beforeMount(() => {
    control = {
      setValue(value: string) {
        $text = value;
      },
    };
  });

  <div>Hello {$text}!</div>;
});
