import {
    DebounceReference,
    DeepFieldReference,
    EdgeReference,
    Reactive,
    Reference,
    SingleFieldReference,
} from "../../src/index.js";

it("test field reference", function () {
    const obj = new Reference<object>({});
    const field = new SingleFieldReference(v => new Reference(v), obj, "test");

    expect(field.V).toBeUndefined();
    obj.V = { test: 22 };
    expect(field.V).toBe(22);
    obj.V = { test: 33, test2: 22 };
    expect(field.V).toBe(33);
    field.V = 25;
    expect(obj.V).toEqual({ test: 25, test2: 22 });
    obj.V = {};
    expect(field.V).toBeUndefined();
    field.V = 24;
    expect(obj.V).toEqual({ test: 24 });
    field.V = 25;
    expect(obj.V).toEqual({ test: 25 });
    field.destroy();
});

it("test field reference of undefined", function () {
    const obj = new Reference<object | undefined>(undefined);
    const field = new SingleFieldReference(v => new Reference(v), obj, "test");

    expect(field.V).toBeUndefined();
    field.V = 24;
    expect(obj.V).toEqual({ test: 24 });
    field.destroy();
});

it("test deep field reference", function () {
    const obj = new Reference<object>({ test: { test2: 22 } });
    const field = new DeepFieldReference(v => new Reference(v), obj, ["test", "test2"]);

    expect(field.V).toBe(22);
    obj.V = { test: { test2: 33, test3: 22 }, test4: 44 };
    expect(field.V).toBe(33);
    field.V = 25;
    expect(obj.V).toEqual({ test: { test2: 25, test3: 22 }, test4: 44 });
    obj.V = {};
    expect(field.V).toBeUndefined();
    field.destroy();
});

it("test deep field reference of undefined", function () {
    const obj = new Reference<object | undefined>(undefined);
    const field = new DeepFieldReference(v => new Reference(v), obj, ["test", "test2"]);

    expect(field.V).toBeUndefined();
    field.V = 24;
    expect(obj.V).toEqual({ test: { test2: 24 } });
    field.destroy();
});

it("test deep field reference destroy", function () {
    const obj = new Reference<object | undefined>(undefined);
    const field = new DeepFieldReference(v => new Reference(v), obj, ["test", "test2"]);

    expect(field.V).toBeUndefined();
    field.destroy();
    field.V = 24;
    expect(field.V).toBeUndefined();
});

it("test deep field reference context destroy", function () {
    const ctx0 = new Reactive(0);
    const ctx1 = new Reactive(1);
    const obj = new Reference<object | undefined>(undefined, ctx0);
    const field = new DeepFieldReference(v => new Reference(v), obj, ["test", "test2"], ctx1);

    expect(field.V).toBeUndefined();
    ctx1.destroy(1);
    field.V = 24;
    expect(field.V).toBeUndefined();
});

it("test reactivity edge ref", function () {
    let test = false;
    const edge = new EdgeReference(
        v => new Reference(v),
        () => test,
        value => (test = value),
    );

    expect(test).toBe(false);
    edge.V = true;
    expect(test).toBe(true);
});

it("test reactivity edge ref with subscriber", function () {
    const ctx = new Reactive(0);
    let test = false;
    let update: ((v: boolean) => void) | null = null;
    const edge = new EdgeReference(
        v => new Reference(v),
        () => test,
        value => (test = value),
        ctx,
        setter => {
            update = v => {
                setter(v);
                test = v;
            };
            return () => {
                update = null;
            };
        },
    );

    expect(test).toBe(false);
    (update as ((v: boolean) => void) | null)?.(true);
    expect(test).toBe(true);
    expect(edge.V).toBe(true);
    edge.V = false;
    expect(test).toBe(false);
    ctx.destroy(0);
    expect(update).toBeNull();
});

it("test reference debounce update", function (done) {
    const ref = new Reference(0);
    const debounce = new DebounceReference(v => new Reference(v), ref, 1);

    expect(debounce.V).toBe(0);
    ref.V = 1;
    expect(debounce.V).toBe(0);
    setTimeout(() => {
        expect(debounce.V).toBe(1);
        done();
    }, 1);
});

it("test reference debounce update via debounce ref", function (done) {
    const ref = new Reference(0);
    const debounce = new DebounceReference(v => new Reference(v), ref, 1);

    expect(debounce.V).toBe(0);
    debounce.V = 1;
    expect(debounce.V).toBe(0);
    setTimeout(() => {
        expect(debounce.V).toBe(1);
        done();
    }, 1);
});

it("test reference debounce destroy", function (done) {
    const ref = new Reference(0);
    const debounce = new DebounceReference(v => new Reference(v), ref, 1);

    expect(debounce.V).toBe(0);
    ref.V = 1;
    expect(debounce.V).toBe(0);
    debounce.destroy();
    setTimeout(() => {
        expect(debounce.V).toBe(0);
        done();
    }, 1);
});

it("test reference debounce context destroy", function (done) {
    const ctx0 = new Reactive(0);
    const ctx1 = new Reactive(1);
    const ref = new Reference(0, ctx0);
    const debounce = new DebounceReference(v => new Reference(v), ref, 1, ctx1);

    expect(debounce.V).toBe(0);
    ref.V = 1;
    expect(debounce.V).toBe(0);
    ctx1.destroy(1);
    setTimeout(() => {
        expect(debounce.V).toBe(0);
        done();
    }, 1);
});
