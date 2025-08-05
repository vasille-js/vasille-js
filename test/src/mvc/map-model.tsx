import { bridge, compose, For } from "vasille-web";

const model = bridge.mapModel([[0, 'a']]);

export const control = {
  setValue(key: number, value: string) {
    model.set(key, value);
  }
};

export const Component = compose(() => {
  <For of={model} slot={value => {
    <div>
      Hello {value}!
    </div>;
  }}/>;
});

