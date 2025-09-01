import { view, For, setModel, component } from "vasille-web";

const model = setModel(["m"]);

export const control = {
  addValue(value: string) {
    model.add(value);
  },
  removeValue(value: string) {
    model.delete(value);
  },
};

export const SetModelTest = component(() => {
  <For
    of={model}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
