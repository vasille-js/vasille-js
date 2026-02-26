import { view, ref, beforeMount, component } from "steel-frame";

export let control: { setValue(value: string): void } | undefined = undefined;

export const RefStateTest = component(() => {
  let $r = ref("test");

  beforeMount(() => {
    control = {
      setValue(value: string) {
        $r = value;
      },
    };
  });

  <div>Hello {$r}!</div>;
});
