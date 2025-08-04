import { compose, $ as VasilleWeb } from "vasille-web";
let a = VasilleWeb.ref(2);
let b = VasilleWeb.ex(Vasille_a => Vasille_a + 1, [a]);
let c = VasilleWeb.ex((Vasille_a, Vasille_b) => {
  return Vasille_a + Vasille_b;
}, [a, b]);
const d = VasilleWeb.sam();
const e = VasilleWeb.sam([1, 2, 3]);
const f = VasilleWeb.ssm([1, 2, 3]);
const g = VasilleWeb.smm([[1, 2], [2, 3]]);
const h = VasilleWeb.sro({
  a: 1,
  b: 2
});
const i = 0;
h.a.$ = 3;
VasilleWeb.ex(Vasille_c => {
  console.log(Vasille_c, VasilleWeb.rv(a));
}, [c]);
const C = compose(Vasille => {
  const z = Vasille.ref(0, "z");
  const o = VasilleWeb.ro(Vasille, {
    a: 1
  }, "o");
  const y = z;
  const x = VasilleWeb.ref(23);
  const embed = Vasille.ref(a.$, "embed");
  const hybrid = Vasille.own(VasilleWeb.ex((Vasille_z, Vasille_a) => Vasille_z + Vasille_a, [z, a]), "hybrid");
  z.$;
  o.a.$;
  VasilleWeb.rv(i);
  x.destroy();
  function overrideTest() {
    const bridge = {
      ref(x) {
        return x;
      }
    };
    const xx = bridge.ref(2);
  }
}, "VasilleWeb:C");
