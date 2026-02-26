import { view, For, mapModel, component } from "steel-frame";

const model = mapModel([[0, "a"]]);

export const control = {
  setValue(key: number, value: string) {
    model.set(key, value);
  },
};

export const MapModelTest = component(() => {
  <For
    of={model}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
