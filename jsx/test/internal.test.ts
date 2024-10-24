import { Expression, Fragment, IValue, Reference } from "vasille";
import { $ } from "../src";
import { createNode } from "./page";
import { PartialExpression } from "../src/expression";

it("let", function () {
    const node = createNode();
    const value = 4;
    const ref = new Reference(5);

    expect($.let(null, value)).toBe(value);
    expect($.let(null, ref)).toBe(ref.$);
    expect($.let(node, value) instanceof IValue).toBe(true);
    expect($.let(node, ref)).toBe(ref);
    node.destroy();
});

it("var", function () {
    const value = 4;
    const ref = new Reference(5);
    const varValue = $.var(value);
    const varRef = $.var(ref);

    expect(varValue.$).toBe(value);
    expect(varRef.$).toBe(ref.$);
    expect(varRef === ref).toBe(false);
});

it("expr", function () {
    const node = createNode();
    const value = 4;
    const value2 = 2;
    const ref = new Reference(5);

    expect($.expr(null, (a: number, b: number) => a + b, [value, ref])).toBe(value + ref.$);
    expect($.expr(node, (a: number, b: number) => a + b, [value, value2])).toBe(value + value2);
    expect(($.expr(node, (a: number, b: number) => a + b, [value, ref]) as IValue<unknown>).$).toBe(value + ref.$);
});

it("object functions", function () {
    const o1 = new Reference({ p: 1 });
    const o2 = { p1: new Reference({ p2: 2 }) };
    const o3 = $.ro(null, { p: 5 }) as any;

    expect($.rp(o1, ["p"])).toBe(o1.$.p);
    expect($.rp(o2, ["p1", "p2"])).toBe(o2.p1.$.p2);

    $.wp(o1, ["p"], 3);
    $.wp(o2, ["p1", "p2"], 4);
    expect(o1.$.p).toBe(3);
    expect(o2.p1.$.p2).toBe(4);

    const readExpr = $.pe(o2, ["p1", "p2"]);

    expect(readExpr instanceof Expression).toBe(true);
    expect((readExpr as Expression<unknown, unknown[]>).$).toBe(o2.p1.$.p2);
    expect($.rv(o1)).toBe(o1.$);

    $.sv(o1, { p: 7 });
    expect(o1.$.p).toBe(7);

    expect(o3.p instanceof IValue).toBe(true);
    expect((o3.p as IValue<unknown>).$).toBe(5);
});

it("model functions", function () {
    const node = createNode();
    const set1 = $.sm(null, [1, 2]);
    const set2 = $.sm(node, [2, 3]);
    const map1 = $.mm(null, [
        [2, 3],
        [3, 4],
    ]);
    const map2 = $.mm(node, [
        [1, 2],
        [5, 6],
    ]);
    const arr1 = $.am(null, [1, 2]);
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
