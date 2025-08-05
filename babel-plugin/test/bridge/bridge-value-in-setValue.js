import { $ as VasilleWeb } from "vasille-web";
const a = VasilleWeb.r(2);
const b = VasilleWeb.r(3);
VasilleWeb.ex(Vasille_a => {
  b.$ = 2 + Vasille_a;
}, [a]);
export {};
