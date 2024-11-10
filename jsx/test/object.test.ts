import { ArrayModel, Expression, IValue, Pointer, Reference } from "vasille";
import { reactiveObject, reactiveObjectProxy } from "../src/objects";
import { createNode } from "./page";

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
    const r2: {
        a: IValue<number>;
        b: IValue<number>;
        c?: IValue<number>;
        d?: IValue<number>;
    } = reactiveObject(node, {
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

    // @ts-ignore
    expect(r2.c.$).toBeUndefined();

    // @ts-ignore
    r2.d.$ = 23;
    // @ts-ignore
    expect(r2.d.$).toBe(23);

    delete r2.c;
    // @ts-ignore
    expect(r2.c.$).toBeUndefined();
});

it("reactive object proxy", function () {
    const node = createNode();
    const o = reactiveObject(node, { a: 4 });
    const rop = reactiveObjectProxy(o);

    expect(rop.a).toBe(4);

    rop.a = 5;
    expect(o.a.$).toBe(5);
});
