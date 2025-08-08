import { For, store, view } from "vasille-web";

export const model = store(() => {
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
})();

export const Component = view(() => {
  <For
    of={model.arr}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
