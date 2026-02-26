import { component, For, store, view } from "steel-frame";

const modelStore = store(() => {
  const arr = ["x"];

  return {
    arr,
    addValue(value: string) {
      arr.push(value);
    },
    replaceValue(index: number, value: string) {
      arr[index] = value;
    },
  };
});

const Component = component(() => {
  <For
    of={modelStore.arr}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});

export const x = { model: modelStore, Component };
