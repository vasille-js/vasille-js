import { compose, $ as VasilleDX } from "vasille-dx";
import { Reference } from "vasille";
function tag(args, count) {
  return args.join("");
}
function tag2(a1, a2) {
  return a1 + a2;
}
export const C = compose(Vasille => {
  const a = Vasille.ref(3, "a");
  const b = Vasille.own(VasilleDX.ex(Vasille_a => Vasille_a + 1, [a]), "b");
  const s = Vasille.ref("s", "s");
  const f = Vasille.ref(null, "f");
  const o = VasilleDX.ro(Vasille, {
    m: {
      n: 0
    }
  }, "o");
  const r = new Reference(0);
  const calc = Vasille.expr(async (Vasille_a, Vasille_b, Vasille_s, Vasille_o_m, Vasille_r_$, Vasille_f) => {
    const v1 = tag`${Vasille_a}1`;
    const [v2, v3] = [Vasille_a, Vasille_b];
    const v4 = (Vasille_a || Vasille_b) & Vasille_a;
    const v5 = new Number(Vasille_a);
    const v6 = !Vasille_b;
    // @ts-ignore
    const v7 = (Vasille_a, ++b.$);
    const v8 = await Vasille_a;
    const v9 = tag.bind(null, Vasille_s);
    const VMap = Map;
    const v10 = new VMap([[Vasille_s, Vasille_a]]);
    const v11 = Vasille_a;
    const v12 = Vasille_a;
    const v13 = Vasille_o_m.n;
    const v14 = Vasille_r_$;
    const obj = {
      a: Vasille_a,
      [Vasille_b]: Vasille_b,
      getA() {
        return Vasille_a;
      },
      ...{
        s: Vasille_s
      }
    };
    function* generator(i) {
      yield i + Vasille_a;
      yield i + 10 + Vasille_a;
    }

    // @ts-ignore
    Vasille_f?.(Vasille_a);
    [a.$, b.$] = [Vasille_b, Vasille_a];
    // @ts-ignore
    (null, tag2)("test", "2");
    return 2;
  }, [a, b, s, o.m, r, f], "calc");
}, "VasilleDX:C");
