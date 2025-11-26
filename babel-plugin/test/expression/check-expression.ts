import { bind, calculate, compose } from "steel-frame";
import { Reference } from "vasille";

function tag(args: TemplateStringsArray, count: number): string {
  return args.join("");
}

function tag2(a1: string, a2: string) {
  return a1 + a2;
}

const C = compose(() => {
  let $a = 3;
  let $b = bind($a + 1);
  let $s = "s";
  let $f: ((a: number) => void) | null = null;
  const o = { m: { n: 0 } };
  const r = new Reference(0);

  const $calc = calculate(async () => {
    const v1 = tag`${$a}1`;
    const [v2, v3] = [$a, $b];
    const v4 = ($a || $b) & $a;
    const v5 = new Number($a);
    const v6 = !$b;
    // @ts-ignore
    const v7 = ($a, ++$b);
    const v8 = await (<Promise<number>>($a as unknown));
    const v9 = tag.bind(null, $s);
    const VMap = Map<string, number>;
    const v10 = new VMap([[$s, $a]]);
    const v11 = $a as number;
    const v12 = $a satisfies number;
    const v13 = o.m.n;
    const v14 = r.V;
    const obj = {
      a: $a,
      [$b]: $b,
      getA() {
        return $a;
      },
      ...{ s: $s },
    };

    function* generator(i) {
      yield i + $a;
      yield i + 10 + $a;
    }

    // @ts-ignore
    $f?.($a);
    [$a, $b] = [$b, $a];
    // @ts-ignore
    (null, tag2)("test", "2");

    return 2;
  });
});
