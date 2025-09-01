import { view, For, beforeMount, component } from "vasille-web";

export let control:
  | {
      addValue(value: string): void;
      removeValue(value: string): void;
    }
  | undefined = undefined;

export const SetModelStateTest = component(() => {
  const model = new Set(["m"]);

  beforeMount(() => {
    control = {
      addValue(value: string) {
        model.add(value);
      },
      removeValue(value: string) {
        model.delete(value);
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
