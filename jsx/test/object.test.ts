import { ArrayModel, Expression, Pointer, Reference } from "vasille";
import { internal } from "../src/internal";
import { propertyExtractor, reactiveObject, readProperty, writeValue } from "../src/objects";
import { createNode } from "./page";

it("read property", function () {
    const o = {
        a: new Reference({ b: 2 }),
        b: new Reference({ c: new Reference({ d: 1 }) }),
        c: { d: 3 },
    };

    expect(readProperty(o, ["a"])).toBe(o.a);
    expect(readProperty(o, ["a", "$"])).toBe(o.a);
    expect(readProperty(o, ["a", "b"])).toBe(2);
    expect(readProperty(o, ["a", "$", "b"])).toBe(2);

    expect(propertyExtractor(o, ["a"])).toBe(o.a);
    expect(propertyExtractor(o, ["c", "d"])).toBe(3);
    expect(propertyExtractor(o, ["b", "$", "c", "d"]) instanceof Expression).toBe(true);
    expect(() => propertyExtractor(o, ["b", "c", "d"])).toThrow("time-complexity");
});

it("write property", function () {
    const o = {
        a: new Reference({ b: 2 }),
        b: new Pointer(new Reference(2)),
        c: new ArrayModel([-1]),
    };
    const ref = new Reference(4);

    writeValue(o, ["a", "b"], 3);
    expect(o.a.$.b).toBe(3);
    writeValue(o, ["a", "$", "b"], 4);
    expect(o.a.$.b).toBe(4);

    writeValue(o, ["a"], { b: 5 });
    expect(o.a.$.b).toBe(5);
    writeValue(o, ["a", "$"], { b: 6 });
    expect(o.a.$.b).toBe(6);

    expect(o.b.$).toBe(2);
    writeValue(o, ["b"], ref);
    expect(o.b.$).toBe(4);

    expect(o.c[0]).toBe(-1);
    writeValue(o, ["c", 0], 1);
    expect(o.c[0]).toBe(1);
});

interface CD {
    c: number;
    d?: number;
}

it("proxy object", function () {
    const node = createNode();
    const ref = new Reference(4);

    const r1 = reactiveObject(node, {
        a: {
            b: {
                c: 2,
                d: 3,
            } as CD,
        },
        b: ref,
        c: 3,
    });
    const r2 = reactiveObject(null, {
        a: 3,
        b: 4,
    });
    let counter = 0;

    r1.a.on(() => {
        counter++;
    });

    expect(r1.b).toBe(ref);
    expect(r1.c.$).toBe(3);
    expect(r1.a.$.b.c).toBe(2);
    expect(r2.a.$).toBe(3);

    r1.a.$.b.c = 3;
    expect(r1.a.$.b.c).toBe(3);
    // set calls define property, counter increased by 2
    expect(counter).toBe(2);

    delete r1.a.$.b.d;
    expect(r1.a.$.b.d).toBeUndefined();
    expect(counter).toBe(3);

    Object.defineProperty(r1.a.$.b, "d", { value: 5 });
    expect(r1.a.$.b.d).toBe(5);
    expect(counter).toBe(4);
});
