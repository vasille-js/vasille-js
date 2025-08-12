import { Backward, Expression, Forward, Reference } from "../../src/index.js";

it("ivalue", function () {
    const ref = new Reference(22);
    const nullRef = new Reference(null);

    expect(JSON.stringify(ref)).toBe("22");
    expect(`${ref}`).toBe("22");
    expect(`${nullRef}`).toBe("iValue<void>");
});

it("expression", function () {
    const a = new Reference(2);
    const b = new Reference(3);
    const c = new Expression((a, b) => a + b, [a, b]);

    expect(c.V).toBe(5);
    c.V = 10;
    expect(c.V).toBe(10);
    a.V++;
    expect(c.V).toBe(6);

    c.destroy();

    b.V++;
    expect(c.V).toBe(6);
});

it("forward", function () {
    const a = new Reference(2);
    const b = new Forward(a);

    expect(b.V).toBe(2);
    a.V++;
    expect(b.V).toBe(3);
    b.destroy();
    a.V--;
    expect(b.V).toBe(3);
});

it("backward", function () {
    const a = new Reference(2);
    const b = new Backward(a);

    expect(b.V).toBe(2);
    a.V = 5;
    expect(b.V).toBe(2);
    b.V = 10;
    expect(a.V).toBe(10);
});
