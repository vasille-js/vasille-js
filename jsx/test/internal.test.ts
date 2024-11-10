import { IValue } from "vasille";
import { $ } from "../src";
import { ContextArray, ContextMap, ContextSet } from "../src/models";
import { createNode } from "./page";

it("model functions", function () {
    const node = createNode();
    const set1 = new ContextSet([1, 2]);
    const set2 = $.sm(node, [2, 3]);
    const map1 = new ContextMap([
        [2, 3],
        [3, 4],
    ]);
    const map2 = $.mm(node, [
        [1, 2],
        [5, 6],
    ]);
    const arr1 = new ContextArray([1, 2]);
    const arr2 = $.am(node, [1, 2]);

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
    const a = $.r<number>(2);
    const b = $.fo<number>(a);
    const ex = $.ex<number, [number, number]>((a, b) => a + b, a, b);

    expect(a.$).toBe(2);
    expect(b.$).toBe(2);
    expect(ex.$).toBe(4);

    b.$ = 3;
    expect(ex.$).toBe(5);
});

it("reactive objects", function () {
    const node = createNode();
    const ro = $.ro(node, { a: 2 });
    const rop = $.rop<{ a: IValue<number> }>(ro);

    expect(rop.a).toBe(2);
});
