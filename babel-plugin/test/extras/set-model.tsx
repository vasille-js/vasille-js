import { store, For, component, setModel } from "steel-frame";

const modelStore = store(() => {
  const s = setModel(["m"]);

  return {
    s,
    addValue(value: string) {
      s.add(value);
    },
    removeValue(value: string) {
      s.delete(value);
    },
  };
});

const Component = component(() => {
  <For
    of={modelStore.s}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});

export const x = { model: modelStore, Component };
