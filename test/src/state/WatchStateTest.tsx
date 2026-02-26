import { beforeMount, component, view, watch } from "steel-frame";

export let control: { setValue(value: string): void } | undefined = undefined;

export const WatchStateTest = component(() => {
  let $name = "Vasille";
  let $external = "test";

  watch(() => {
    $name = "+" + $external;
  });

  beforeMount(() => {
    control = {
      setValue(value: string) {
        $external = value;
      },
    };
  });

  <div>Hello {$name}!</div>;
});
