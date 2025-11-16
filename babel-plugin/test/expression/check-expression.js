import { bind, calculate, compose, ref as VasilleRef } from "vasille-web";
import { Reference } from "vasille";
function tag(args, count) {
  return args.join("");
}
function tag2(a1, a2) {
  return a1 + a2;
}
const C = compose(Vasille => {
  const $a = VasilleRef(3);
  const $b = bind(Vasille, Vasille_0 => Vasille_0 + 1, [$a]);
  const $s = VasilleRef("s");
  const $f = VasilleRef(null);
  const o = {
    m: {
      n: 0
    }
  };
  const r = new Reference(0);
  const $calc = calculate(Vasille, async (Vasille_0, Vasille_1, Vasille_2, Vasille_3) => {
    const v1 = tag`${Vasille_0}1`;
    const [v2, v3] = [Vasille_0, Vasille_1];
    const v4 = (Vasille_0 || Vasille_1) & Vasille_0;
    const v5 = new Number(Vasille_0);
    const v6 = !Vasille_1;
    // @ts-ignore
    const v7 = (Vasille_0, ++$b.V);
    const v8 = await Vasille_0;
    const v9 = tag.bind(null, Vasille_2);
    const VMap = Map;
    const v10 = new VMap([[Vasille_2, Vasille_0]]);
    const v11 = Vasille_0;
    const v12 = Vasille_0;
    const v13 = o.m.n;
    const v14 = r.V;
    const obj = {
      a: Vasille_0,
      [Vasille_1]: Vasille_1,
      getA() {
        return Vasille_0;
      },
      ...{
        s: Vasille_2
      }
    };
    function* generator(i) {
      yield i + Vasille_0;
      yield i + 10 + Vasille_0;
    }

    // @ts-ignore
    Vasille_3?.(Vasille_0);
    [$a.V, $b.V] = [Vasille_1, Vasille_0];
    // @ts-ignore
    (null, tag2)("test", "2");
    return 2;
  }, [$a, $b, $s, $f]);
});
