import { store, ref as VasilleRef } from "vasille-web";
const userStore = store(Vasille => {
  const $a = VasilleRef(1);
  return {
    $a
  };
});
userStore.$a?.V;
