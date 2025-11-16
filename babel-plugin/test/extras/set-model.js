import { store, For, component, setModel as VasilleSetModel } from "vasille-web";
const modelStore = store(Vasille => {
  const s = VasilleSetModel(Vasille, ["m"]);
  return {
    s,
    addValue(value) {
      s.add(value);
    },
    removeValue(value) {
      s.delete(value);
    }
  };
});
const Component = component(Vasille => {
  For({
    of: modelStore.s,
    slot: (Vasille, value) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text("Hello ");
        Vasille.text(value);
        Vasille.text("!");
      });
    }
  }, Vasille);
});
export const x = {
  model: modelStore,
  Component
};
