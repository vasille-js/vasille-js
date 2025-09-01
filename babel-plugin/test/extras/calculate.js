import { store, calculate, component, ref as VasilleRef } from "vasille-web";
const modelStore = store(Vasille => {
  const $r = VasilleRef("test", "r");
  const $text = calculate(Vasille, Vasille_r => {
    return "+" + Vasille_r;
  }, [$r], "text");
  return {
    $r,
    $text,
    setValue(value) {
      $r.V = value;
    }
  };
}, "modelStore");
const Component = component(Vasille => {
  Vasille.tag("div", {}, Vasille => {
    Vasille.text("Hello ");
    Vasille.text(modelStore.$text);
    Vasille.text("!");
  });
}, "Component");
export const x = {
  model: modelStore,
  Component
};
