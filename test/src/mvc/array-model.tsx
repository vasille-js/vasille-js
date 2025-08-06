import { For, bridge, view } from "vasille-web";

const model = bridge.arrayModel(["x"]);

export const control = {
  addValue(value: string) {
    model.push(value)
  },
  replaceValue(index: number, value: string) {
    model[index] = value;
  }
};

export const Component = view(() => {

  <For of={model} slot={value => {
    <div>
      Hello {value}!
    </div>;
  }}/>;
});

