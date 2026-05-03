import { Expression, Reference } from "../../src/index.js";
import { TestExpression } from "../page.js";

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
    const c = new TestExpression((a, b) => a + b, [a, b]);

    expect(c.V).toBe(5);
    c.V = 10;
    expect(c.V).toBe(10);
    a.V++;
    expect(c.V).toBe(6);

    c.destroy();

    b.V++;
    expect(c.V).toBe(6);
});
