import { store, view, For } from "vasille-web";

export const model = store(() => {
  const s = new Set(["m"])

  return {
    s,
    addValue(value: string) {
      s.add(value);
    },
    removeValue(value: string) {
      s.delete(value);
    },
  }
})()

export const Component = view(() => {
  <For
    of={model.s}
    slot={value => {
      <div>Hello {value}!</div>;
    }}
  />;
});
