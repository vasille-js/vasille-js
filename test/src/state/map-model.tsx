import { view, For } from "vasille-web";

export let control: {
  setValue(key: number, value: string): void;
} | undefined = undefined;

export const Component = view(() => {
  const model = new Map([[0, 'a']]);

  control = {
    setValue(key: number, value: string) {
      model.set(key, value)
    },
  };

  <For of={model} slot={value => {
    <div>
      Hello {value}!
    </div>;
  }}/>;
});

