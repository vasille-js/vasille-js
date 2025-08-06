import { view, For } from "vasille-web";

export let control:
  | {
      addValue(value: string): void;
      replaceValue(index: number, value: string): void;
    }
  | undefined = undefined;

export const Component = view(() => {
  const model = ["x"];

  control = {
    addValue(value: string) {
      model.push(value);
    },
    replaceValue(index: number, value: string) {
      model[index] = value;
    },
  };

  <For
    of={model}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
