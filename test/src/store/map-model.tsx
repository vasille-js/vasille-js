import { store, view, For, component } from "vasille-web";

const modelStore = store(() => {
  const map = new Map([[0, "a"]]);

  return {
    map,
    setValue(key: number, value: string) {
      map.set(key, value);
    },
  };
});

const Component = component(() => {
  <For
    of={modelStore.map}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});

export const x = { model: modelStore, Component };
