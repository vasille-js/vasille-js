import { IValue, Reference } from "vasille";
import { arrayModel, backward, ensure, expr, forward, mapModel, ref, set, setModel, match } from "../src/internal.js";
import { createNode } from "./page.js";

it("model functions", function () {
    const [node] = createNode();
    const set1 = setModel(undefined, [1, 2]);
    const set2 = setModel(node, [2, 3]);
    const map1 = mapModel(undefined, [
        [2, 3],
        [3, 4],
    ]);
    const map2 = mapModel(node, [
        [1, 2],
        [5, 6],
    ]);
    const arr1 = arrayModel(undefined, [1, 2]);
    const arr2 = arrayModel(node, [1, 2]);

    expect(set1.size).toBe(2);
    expect(set2.size).toBe(2);
    expect(map1.size).toBe(2);
    expect(map2.size).toBe(2);
    expect(arr1.length).toBe(2);
    expect(arr2.length).toBe(2);

    node.destroy();

    expect(set1.size).toBe(2);
    expect(set2.size).toBe(0);
    expect(map1.size).toBe(2);
    expect(map2.size).toBe(0);
    expect(arr1.length).toBe(2);
    expect(arr2.length).toBe(0);
});

it("no context helpers", function () {
    const a = ref<number>(2);
    const b = forward<number>(a);
    const ex = expr<number, [number, number]>(undefined, (a, b) => a + b, [a, b]);
    const rv1 = ensure({ x: 1 }, "x") as unknown as IValue<number | undefined>;
    const rv2 = backward(a);

    expect(a.V).toBe(2);
    expect(b.V).toBe(2);
    expect(ex.V).toBe(4);
    expect(rv1.V).toBe(undefined);
    expect(rv2.V).toBe(2);

    b.V = 3;
    expect(ex.V).toBe(5);

    a.V = 5;
    expect(a.V).toBe(5);
    expect(rv2.V).toBe(2);

    rv2.V = 6;
    expect(a.V).toBe(6);
    expect(rv2.V).toBe(6);
});

it("set test", function () {
    const o = {
        a: 1,
        $b: 2,
        c: ref(3),
    };
    const arr = arrayModel(undefined);
    const c = o.c;

    set(o, "a", 10);
    set(o, "$b", 20);
    set(o, "c", 30);
    set(arr, 0, 1);

    expect(o.a).toBe(10);
    expect(o.$b).toBeInstanceOf(IValue);
    expect(o.c.V).toBe(30);
    expect(o.c).toBe(c);
    expect(arr.length).toBe(1);
    expect(arr[0]).toBe(1);
});

it("match test", function () {
    const a = match("a", 2);
    const $a = match("$a", 3);
    const b = match("b", $a);
    const $b = match("$b", $a);

    expect(a).toBe(2);
    expect($a).toBeInstanceOf(IValue);
    expect($a.V).toBe(3);
    expect(b).toBe(3);
    expect($b).toBeInstanceOf(IValue);
    expect($b.V).toBe(3);
});

it("ensure", function () {
    const o: {x: number; y?: number} = {x: 1};

    const t1 = ensure(null, 'x' as unknown as never);
    const t2 = ensure(o, 'x');
    const t3 = ensure(o, 'y');

    expect(t1).toBeInstanceOf(Reference);
    expect(t1.V).toBeUndefined();
    expect(o.x).toBe(1);
    expect(o.y).toBeInstanceOf(Reference);
    expect(t2).toBe(1);
    // @ts-expect-error
    expect(t3.V).toBeUndefined();
})
