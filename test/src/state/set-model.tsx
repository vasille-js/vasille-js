import { view, For } from "vasille-web";

export let control:
  | {
      addValue(value: string): void;
      removeValue(value: string): void;
    }
  | undefined = undefined;

export const Component = view(() => {
  const model = new Set(["m"]);

  control = {
    addValue(value: string) {
      model.add(value);
    },
    removeValue(value: string) {
      model.delete(value);
    },
  };

  <For
    of={model}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
