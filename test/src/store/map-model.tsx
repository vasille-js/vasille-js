import { store, view, For } from "vasille-web";

export const model = store(() => {
  const map = new Map([[0, "a"]]);

  return {
    map,
    setValue(key: number, value: string) {
      map.set(key, value);
    },
  };
})();

export const Component = view(() => {
  <For
    of={model.map}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
