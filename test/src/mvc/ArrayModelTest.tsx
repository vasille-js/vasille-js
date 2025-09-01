import { arrayModel, component, For, view } from "vasille-web";

const model = arrayModel(["x"]);

export const control = {
  addValue(value: string) {
    model.push(value);
  },
  replaceValue(index: number, value: string) {
    model[index] = value;
  },
};

export const ArrayModelTest = component(() => {
  <For
    of={model}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
