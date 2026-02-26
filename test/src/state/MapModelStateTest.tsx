import { view, For, component, beforeMount } from "steel-frame";

export let control:
  | {
      setValue(key: number, value: string): void;
    }
  | undefined = undefined;

export const MapModelStateTest = component(() => {
  const model = new Map([[0, "a"]]);

  beforeMount(() => {
    control = {
      setValue(key: number, value: string) {
        model.set(key, value);
      },
    };
  });

  <For
    of={model}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
