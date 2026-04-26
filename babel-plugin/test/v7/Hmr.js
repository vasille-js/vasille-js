const VasilleFilePath = "babel-plugin-vasille/test/v7/Hmr.ts";
import { component, ref as VasilleRef } from "steel-frame";
export let C1 = 1;
export let C2 = 2;
export let Hmr = component(Vasille => {
  const $a = VasilleRef(1, Vasille, [VasilleFilePath, 7, 6, 7, 12], "$a");
}, [VasilleFilePath, 6, 19, 8, 2], "Hmr");
import.meta.hot.accept(VasilleNewModule => {
  if (VasilleNewModule) {
    C1 = VasilleNewModule.C1;
    C2 = VasilleNewModule.C2;
    VasilleNewModule.Hmr.recompose(Hmr.fragments);
  }
});