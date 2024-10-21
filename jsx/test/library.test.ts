import { Fragment, IValue, Mirror, Reference } from "vasille";
import { awaited, calculate, ensureIValue, forward, point, watch } from "../src";

it("forward", function () {
    const value = 4;
    const ref = new Reference(5);
    const frag = new Fragment({});
    const test = forward(frag, ref);

    expect(forward(frag, value)).toBe(value);
    expect(test instanceof Mirror).toBe(true);

    ref.$ = 7;
    expect((test as IValue<unknown>).$).toBe(ref.$);
});

it("point", function () {
    const frag = new Fragment({});
    const value = 4;
    const ref = new Reference(5);
    const testValue = point(frag, value);
    const testRef = point(frag, ref);

    expect(testValue instanceof IValue).toBe(true);
    expect(testValue.$).toBe(value);

    ref.$ = 7;
    expect(testRef.$).toBe(ref.$);
});

it("calculate", function () {
    const frag = new Fragment({});
    const value = 4;
    const ref = new Reference(5);
    const sum = calculate(frag, (a: number, b: number) => a + b, value, ref);

    expect((sum as IValue<unknown>).$).toBe(9);

    ref.$ = 7;
    expect((sum as IValue<unknown>).$).toBe(11);
});

it("watch", function () {
    const frag = new Fragment({});
    const value = 4;
    const ref = new Reference(5);
    let test = 0;

    watch(frag, (a: number, b: number) => (test = a + b), value, ref);

    expect(test).toBe(9);

    ref.$ = 7;
    expect(test).toBe(11);
});

it("awaited", function (done) {
    const frag = new Fragment({});
    const promise = new Promise(rv => setTimeout(() => rv(2)));
    const errPromise = new Promise((_, rj) => setTimeout(() => rj(4)));
    const [successErr, successResult] = awaited(frag, promise);
    const [mustFailErr, mustFailResult] = awaited(frag, errPromise);

    expect(successErr.$).toBeUndefined();
    expect(successResult.$).toBeUndefined();
    expect(mustFailErr.$).toBeUndefined();
    expect(mustFailResult.$).toBeUndefined();

    setTimeout(() => {
        expect(successErr.$).toBeUndefined();
        expect(successResult.$).toBe(2);
        expect(mustFailErr.$).toBe(4);
        expect(mustFailResult.$).toBeUndefined();
        done();
    });
});

it("ensure iValue", function () {
    const node = new Fragment({});
    const value = 4;
    const ref = new Reference(5);
    const ensuredValue = ensureIValue(node, value);
    const ensuredRef = ensureIValue(node, ref);

    expect(ensuredValue.$).toBe(value);
    expect(ensuredRef).toBe(ref);
});
