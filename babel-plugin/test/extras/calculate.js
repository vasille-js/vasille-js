import { store, calculate, component, ref as VasilleRef } from "vasille-web";
const modelStore = store(Vasille => {
  const $r = VasilleRef("test");
  const $text = calculate(Vasille, Vasille_0 => {
    return "+" + Vasille_0;
  }, [$r]);
  return {
    $r,
    $text,
    setValue(value) {
      $r.V = value;
    }
  };
});
const Component = component(Vasille => {
  Vasille.tag("div", {}, Vasille => {
    Vasille.text("Hello ");
    Vasille.text(modelStore.$text);
    Vasille.text("!");
  });
});
export const x = {
  model: modelStore,
  Component
};
