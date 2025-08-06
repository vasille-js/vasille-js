import { bridge, view, For } from "vasille-web";

const model = bridge.setModel(['m']);

export const control = {
  addValue(value: string) {
    model.add(value)
  },
  removeValue(value: string) {
    model.delete(value)
  }
};

export const Component = view(() => {
  <For of={model} slot={value => {
    <div>
      Hello {value}!
    </div>;
  }}/>;
});

